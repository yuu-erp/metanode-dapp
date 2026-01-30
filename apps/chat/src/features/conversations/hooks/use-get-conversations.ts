'use client'

import { container } from '@/container'
import type { Conversation } from '@/modules/conversation'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetConversationsQueryOptions(
  accountId?: string
): UseQueryOptions<
  Conversation[],
  Error,
  Conversation[],
  ReturnType<typeof CONVERSATION_QUERY_KEY.CONVERSATIONS>
> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(accountId ?? ''),
    queryFn: async (): Promise<Conversation[]> => {
      if (!accountId) return []
      const conversationService = container.conversationService
      return await conversationService.getConversationList(accountId)
    },
    enabled: !!accountId
  }
}

export function useGetConversations(accountId?: string) {
  return useQuery(createGetConversationsQueryOptions(accountId))
}
