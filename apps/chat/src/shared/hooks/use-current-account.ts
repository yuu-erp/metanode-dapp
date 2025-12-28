'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY } from '../lib/react-query'
import type { Account } from '@/services/account/domain'
import { getSession } from '@/bootstrap'

export type CurrentAccountData = Account

export function createCurrentAccountQueryOptions(): UseQueryOptions<
  CurrentAccountData,
  Error,
  CurrentAccountData,
  typeof ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
> {
  return {
    queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT,
    queryFn: async (): Promise<CurrentAccountData> => {
      const { account } = getSession()
      const currentAccount = await account.accountService.getCurrentAccount()
      if (!currentAccount) throw new Error('No logged in account')
      return currentAccount
    }
  }
}

export function useCurrentAccount() {
  return useQuery(createCurrentAccountQueryOptions())
}
