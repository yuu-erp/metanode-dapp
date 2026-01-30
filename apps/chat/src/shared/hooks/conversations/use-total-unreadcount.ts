import { createGetConversationsQueryOptions } from '@/features/conversations'
import type { Conversation } from '@/modules/conversation'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'

export function useTotalUnreadCount(accountId?: string) {
  return useQuery<
    Conversation[],
    Error,
    number,
    ReturnType<typeof CONVERSATION_QUERY_KEY.CONVERSATIONS>
  >({
    ...createGetConversationsQueryOptions(accountId),
    select: (conversations) =>
      conversations.reduce((total, conv) => total + (conv.unreadCount ?? 0), 0)
  })
}
