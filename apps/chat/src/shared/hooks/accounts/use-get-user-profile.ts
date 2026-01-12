'use client'

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY, queryClient } from '../../lib/react-query'
import type { UserProfileOutput } from '@/modules/blockchain'
import type { Account } from '@/modules/account'
import { container } from '@/container'

export function createGetUserProfileQueryOptions(
  conversationId?: string
): UseQueryOptions<
  UserProfileOutput,
  Error,
  UserProfileOutput,
  ReturnType<typeof ACCOUNT_QUERY_KEY.USER_PROFILE>
> {
  return {
    queryKey: ACCOUNT_QUERY_KEY.USER_PROFILE(conversationId ?? ''),
    queryFn: async (): Promise<UserProfileOutput> => {
      if (!conversationId) throw new Error('conversationId is requid')
      const currentAccount = queryClient.getQueryData<Account>(
        ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
      )
      if (!currentAccount) throw new Error('Bạn chưa đăng nhập vui lòng thử lại sao.')
      const accountService = container.accountService
      return await accountService.useProfile(currentAccount.address, conversationId)
    },
    enabled: !!conversationId
  }
}

export function useGetUserProfile(conversationId?: string) {
  return useQuery(createGetUserProfileQueryOptions(conversationId))
}
