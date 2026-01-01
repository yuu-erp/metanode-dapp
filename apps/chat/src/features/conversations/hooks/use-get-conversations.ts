'use client'

import { container } from '@/container'
import type { Conversation } from '@/modules/conversation'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetConversationsQueryOptions(): UseQueryOptions<
  Conversation[],
  Error,
  Conversation[],
  typeof CONVERSATION_QUERY_KEY.CONVERSATIONS
> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS,
    queryFn: async (): Promise<Conversation[]> => {
      const conversationService = container.conversationService
      return await conversationService.loadInitial()
    }
  }
}

export function useGetConversations() {
  return useQuery(createGetConversationsQueryOptions())
}
