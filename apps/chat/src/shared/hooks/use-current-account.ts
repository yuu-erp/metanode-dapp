'use client'

import type { Account } from '@/interfaces'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY } from '../lib/react-query'
import { accountService } from '@/services/account'

export type CurrentAccountData = Account | null

export function createCurrentAccountQueryOptions(): UseQueryOptions<
  CurrentAccountData,
  Error,
  CurrentAccountData,
  typeof ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
> {
  return {
    queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT,
    queryFn: async (): Promise<CurrentAccountData> => {
      const currentAccount = await accountService.getCurrentAccount()
      if (!currentAccount) return null
      return currentAccount
    }
  }
}

export function useCurrentAccount() {
  return useQuery(createCurrentAccountQueryOptions())
}
