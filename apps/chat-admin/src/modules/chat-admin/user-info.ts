import { methods } from '@/contract'
import { queryKeys } from '@/shared'
import { queryOptions } from '@tanstack/react-query'

export const createUserContractQuery = (address: string) =>
  queryOptions({
    queryKey: queryKeys.admin.userContract(address),
    enabled: !!address,
    queryFn: () =>
      methods.factory.getUserContract({
        user: address
      })
  })

export const createUserInfoQuery = (contractAddress: string) =>
  queryOptions({
    queryKey: queryKeys.admin.userInfo(contractAddress),
    enabled: !!contractAddress,
    queryFn: () =>
      methods.user.getUserProfile(
        {},
        {
          to: contractAddress
        }
      )
  })

export const createIsUserDisabledQuery = (address: string) =>
  queryOptions({
    queryKey: queryKeys.admin.isUserDisabled(address),
    enabled: !!address,
    queryFn: () =>
      methods.factory.isUserDisabled({
        user: address
      })
  })
