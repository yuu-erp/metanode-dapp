'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY } from '../lib/react-query'
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
      console.log('thanhduy account 1')
      const accountService = container.accountService

      const account = await accountService.getCurrentAccount()
      console.log('thanhduy account 2')
      if (!account) {
        console.log('thanhduy account 3')

        throw new Error('No account found')
      }
      console.log('thanhduy account 4')

      return account
    }
  }
}

export function useCurrentAccount() {
  return useQuery(createCurrentAccountQueryOptions())
}
