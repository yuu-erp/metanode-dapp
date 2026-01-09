'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY } from '../../lib/react-query'
import { container } from '@/container'

export function createCheckUserContractQueryOptions(
  address?: string
): UseQueryOptions<
  boolean,
  Error,
  boolean,
  ReturnType<typeof ACCOUNT_QUERY_KEY.CHECK_USER_CONTRACT>
> {
  const safeAddress = address ?? ''
  return {
    queryKey: ACCOUNT_QUERY_KEY.CHECK_USER_CONTRACT(safeAddress),
    queryFn: async (): Promise<boolean> => {
      const accountService = container.accountService
      const isRegister = await accountService.checkUserContract(safeAddress)
      console.log({ isRegister })
      return isRegister
    },
    enabled: !!address
  }
}

export function useCheckUserContract(address?: string) {
  return useQuery(createCheckUserContractQueryOptions(address))
}
