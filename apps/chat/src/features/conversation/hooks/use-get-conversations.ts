'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetConversationsQueryOptions(
  account?: Account
): UseQueryOptions<
  Conversation[],
  Error,
  Conversation[],
  ReturnType<typeof CONVERSATION_QUERY_KEY.CONVERSATIONS>
> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account?.address ?? ''),
    queryFn: async (): Promise<Conversation[]> => {
      const conversationService = container.conversationService
      const rs = await conversationService.getConversationList(account)

      return rs
    },
    enabled: !!account
  }
}

export function useGetConversations(account?: Account) {
  return useQuery(createGetConversationsQueryOptions(account))
}
