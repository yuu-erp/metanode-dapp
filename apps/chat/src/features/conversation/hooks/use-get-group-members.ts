'use client'

import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetGroupMembersQueryOptions(
  accountId?: string,
  conversationId?: string,
  conversationType?: ConversationType
): UseQueryOptions<any[], Error, any[], ReturnType<typeof CONVERSATION_QUERY_KEY.GROUP_MEMBERS>> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.GROUP_MEMBERS(conversationId ?? ''),
    queryFn: async () => {
      if (!accountId || !conversationId) return []
      const conversationService = container.conversationService
      const data = await conversationService.getGroupMembers(
        accountId,
        conversationId,
        conversationType
      )
      return data
    },
    enabled: !!accountId && !!conversationId,
    staleTime: 1000 * 60 * 5
  }
}

export function useGetGroupMembers(
  accountId?: string,
  conversationId?: string,
  conversationType?: ConversationType
) {
  return useQuery(createGetGroupMembersQueryOptions(accountId, conversationId, conversationType))
}

export function useGroupMember() {
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()

  return useGetGroupMembers(account?.address, id, type)
}
