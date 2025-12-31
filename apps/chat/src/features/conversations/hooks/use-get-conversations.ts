'use client'

import type { Conversation } from '@/services/conversations/domain'
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
      console.log('FEATCH LẠI CONVERSATIONS')
      return []
    }
  }
}

export function useGetConversations() {
  return useQuery(createGetConversationsQueryOptions())
}
