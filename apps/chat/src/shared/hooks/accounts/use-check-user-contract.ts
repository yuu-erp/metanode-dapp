'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY } from '../../lib/react-query'
import { container } from '@/container'
import type { Account } from '@/modules/account'

export function createCheckUserContractQueryOptions(
  account?: Account
): UseQueryOptions<
  boolean,
  Error,
  boolean,
  ReturnType<typeof ACCOUNT_QUERY_KEY.CHECK_USER_CONTRACT>
> {
  return {
    queryKey: ACCOUNT_QUERY_KEY.CHECK_USER_CONTRACT(account?.address ?? ''),
    queryFn: async (): Promise<boolean> => {
      const accountService = container.accountService
      const isRegister = await accountService.checkUserContract(account!)
      console.log({ isRegister })
      return isRegister
    },
    enabled: !!account
  }
}

export function useCheckUserContract(account?: Account) {
  return useQuery(createCheckUserContractQueryOptions(account))
}
