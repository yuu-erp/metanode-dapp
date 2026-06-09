'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation, ConversationType } from '@/modules/conversation'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ACCOUNT_QUERY_KEY, CONVERSATION_QUERY_KEY, queryClient } from '../lib/react-query'

export function createGetConversationIdQueryOptions(
  conversationId: string,
  conversationType: ConversationType,
  useDb?: boolean
): UseQueryOptions<
  Conversation | null,
  Error,
  Conversation | null,
  ReturnType<typeof CONVERSATION_QUERY_KEY.CONVERSATION>
> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.CONVERSATION(conversationId),
    queryFn: async (): Promise<Conversation | null> => {
      const currentAccount = queryClient.getQueryData<Account>(
        ACCOUNT_QUERY_KEY.GET_CURRENT_ACCOUNT
      )
      if (!currentAccount) return null
      const conversationService = container.conversationService

      const conversation = await conversationService.getConversationById(
        currentAccount,
        conversationId,
        conversationType,
        useDb
      )

      if (!conversation) return null
      return conversation
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  }
}

export function useGetConversationId(
  conversationId: string,
  conversationType: ConversationType,
  useDb?: boolean
) {
  return useQuery(createGetConversationIdQueryOptions(conversationId, conversationType, useDb))
}

export function getConversationById(id: string, type: string, save = false) {
  return queryClient.ensureQueryData(createGetConversationIdQueryOptions(id, type as any, save))
}
