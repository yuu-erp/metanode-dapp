'use client'

import { getSession } from '@/bootstrap'
import type { Conversation } from '@/services/conversations/domain'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { CONVERSATION_QUERY_KEY } from '../lib/react-query'

export function createGetConversationsQueryOptions(): UseQueryOptions<
  Conversation[],
  Error,
  Conversation[],
  typeof CONVERSATION_QUERY_KEY.CONVERSATIONS
> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS,
    queryFn: async (): Promise<Conversation[]> => {
      const { conversation } = getSession()
      if (!conversation) return []
      return await conversation?.service.loadInitial()
    }
  }
}

export function useGetConversations() {
  return useQuery(createGetConversationsQueryOptions())
}
