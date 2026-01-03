'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { Account } from '@/modules/account'
import { container } from '@/container'
import { ACCOUNT_QUERY_KEY } from '@/shared/lib/react-query'

export function createLoadAccountQueryOptions(): UseQueryOptions<
  Account[],
  Error,
  Account[],
  typeof ACCOUNT_QUERY_KEY.LOAD_ACCOUNTS
> {
  return {
    queryKey: ACCOUNT_QUERY_KEY.LOAD_ACCOUNTS,
    queryFn: async (): Promise<Account[]> => {
      const accountService = container.accountService
      return await accountService.loadAccounts()
    }
  }
}

export function useLoadAccounts() {
  return useQuery(createLoadAccountQueryOptions())
}
