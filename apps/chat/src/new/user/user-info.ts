import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import { getCurrentAccount } from '@/shared/hooks'
import { queryClient, USER_QUERY_KEY } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export const createUserInfoQuery = (contractAddress: string = '') =>
  queryOptions({
    queryKey: USER_QUERY_KEY.info(contractAddress),
    enabled: !!contractAddress,
    queryFn: async () => {
      const account = await getCurrentAccount()

      return container.userContract.userProfile({
        from: account.hiddenAddress,
        to: contractAddress
      })
    }
  })

export const createUserContractAddressQuery = (address = '') =>
  queryOptions({
    queryKey: USER_QUERY_KEY.contractAddress(address),
    enabled: !!address,
    queryFn: async () => {
      const account = await getCurrentAccount()
      return container.factoryContract.getUserContract({
        from: account.hiddenAddress,
        inputData: { user: address }
      })
    }
  })

export function useUserContractAddress(address: string) {
  return useQuery(createUserContractAddressQuery(address))
}

export function getUserContractAddress(address: string) {
  return queryClient.ensureQueryData(createUserContractAddressQuery(address))
}

export function useUserInfo(contractAddress?: string) {
  return useQuery(createUserInfoQuery(contractAddress))
}

export function getUserInfo(contractAddress?: string) {
  return queryClient.ensureQueryData(createUserInfoQuery(contractAddress))
}

export function useNameBySender(sender: string = '') {
  const { base } = useCurrentState()
  const { type } = base
  const { data: contractAddress } = useUserContractAddress(type === 'group' ? sender : '')

  const { data: info } = useUserInfo(
    type === 'group' ? contractAddress : type === 'p2p' ? sender : ''
  )
  return info?.firstName ?? sender
}

export function useName(identity?: string, type?: string) {
  const [name, setName] = useState('')
  const { base } = useCurrentState()
  const finalType = type ?? base.type

  useEffect(() => {
    ;(async () => {
      if (!identity) return
      switch (finalType) {
        case 'p2p': {
          setName((await getUserInfo(identity)).firstName)
          break
        }

        case 'group': {
          const userContract = await getUserContractAddress(identity)
          setName((await getUserInfo(userContract)).firstName)
          break
        }

        case 'anonymous_group': {
          setName(identity)
          break
        }
      }
    })()
  }, [identity, finalType])

  return { name }
}
