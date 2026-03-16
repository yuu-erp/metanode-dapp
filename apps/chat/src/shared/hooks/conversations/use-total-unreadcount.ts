import { createGetConversationsQueryOptions } from '@/features/conversation'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'

export function useTotalUnreadCount(account?: Account) {
  return useQuery<
    Conversation[],
    Error,
    number,
    ReturnType<typeof CONVERSATION_QUERY_KEY.CONVERSATIONS>
  >({
    ...createGetConversationsQueryOptions(account),
    select: (conversations) =>
      conversations.reduce((total, conv) => total + (conv.unreadCount ?? 0), 0)
  })
}
