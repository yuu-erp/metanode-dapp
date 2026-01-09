'use client'

import { container } from '@/container'
import type { Message } from '@/modules/message'
import { MESSAGE_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetMessageQueryOptions(
  accountId?: string,
  conversationId?: string
): UseQueryOptions<Message[], Error, Message[], ReturnType<typeof MESSAGE_QUERY_KEY.MESSAGES>> {
  return {
    queryKey: MESSAGE_QUERY_KEY.MESSAGES(accountId ?? '', conversationId ?? ''),
    queryFn: async (): Promise<Message[]> => {
      if (!accountId || !conversationId) return []
      const messageService = container.messageService
      return await messageService.getMessagesByConversation(accountId, conversationId)
    },
    enabled: !!accountId && !!conversationId
  }
}

export function useGetMessages(accountId?: string, conversationId?: string) {
  return useQuery(createGetMessageQueryOptions(accountId, conversationId))
}
