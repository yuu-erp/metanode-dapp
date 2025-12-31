'use client'

import { getSession } from '@/bootstrap'
import type { Conversation } from '@/services/conversations/domain'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { CONVERSATION_QUERY_KEY } from '../lib/react-query'

export function createGetConversationIdQueryOptions(
  conversationId: string
): UseQueryOptions<
  Conversation | null,
  Error,
  Conversation | null,
  ReturnType<typeof CONVERSATION_QUERY_KEY.CONVERSATION>
> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.CONVERSATION(conversationId),
    queryFn: async (): Promise<Conversation | null> => {
      const { conversation } = getSession()
      if (!conversation) return null
      const conversationUser = await conversation?.service.getConversation(conversationId)
      if (!conversationUser) return null
      return conversationUser
    },
    enabled: !!conversationId
  }
}

export function useGetConversationId(conversationId: string) {
  return useQuery(createGetConversationIdQueryOptions(conversationId))
}
