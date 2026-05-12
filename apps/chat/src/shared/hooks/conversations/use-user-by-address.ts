import { container } from '@/container'
import { ACCOUNT_QUERY_KEY, CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createUserContractQuery } from './use-user-contract'

export const createPofile = (myAddress: string, conversationId: string) =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.PROFILE(conversationId),
    queryFn: async () => {
      const rs = await container.userContract.userProfile({
        from: myAddress,
        to: conversationId
      })
      return { ...rs, name: `${rs.lastName} ${rs.firstName}`.trim() }
    }
  })

const createUserByAddressQuery = (myAddress: string, address: string) =>
  queryOptions({
    queryKey: ACCOUNT_QUERY_KEY.PROFILE_BY_ADDRESS(address),
    queryFn: async () => {
      const contractAddress = await queryClient.ensureQueryData(
        createUserContractQuery(myAddress, address)
      )

      return await queryClient.ensureQueryData(createPofile(myAddress, contractAddress))
    }
  })

export async function getUserByAddress(myAddress: string, address: string) {
  return await queryClient.ensureQueryData(createUserByAddressQuery(myAddress, address))
}

export function useProfileByAddress(myAddress: string, address: string) {
  return useQuery(createUserByAddressQuery(myAddress, address))
}

export async function getUser(me: string, contractAddress: string) {
  return await queryClient.ensureQueryData(createPofile(me, contractAddress))
}
