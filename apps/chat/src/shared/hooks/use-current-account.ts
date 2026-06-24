'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY, queryClient } from '../lib/react-query'
import type { Account } from '@/modules/account'
import { container } from '@/container'

export type CurrentAccountData = Account | undefined

export function createCurrentAccountQueryOptions(): UseQueryOptions<
  CurrentAccountData,
  Error,
  CurrentAccountData,
  typeof ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
> {
  return {
    queryKey: ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT,
    queryFn: async (): Promise<CurrentAccountData> => {
      const accountService = container.accountService

      const account = await accountService.getCurrentAccount()

      if (!account) {
        throw new Error('No account found')
      }

      return account
    }
  }
}

export function useCurrentAccount() {
  const query = useQuery(createCurrentAccountQueryOptions())
  return { ...query, account: query.data }
}

export const getCurrentAccount = async () => {
  const rs = await queryClient.ensureQueryData(createCurrentAccountQueryOptions())
  if (!rs) throw new Error('[getCurrentAccount] Invalid account')
  return rs
}
