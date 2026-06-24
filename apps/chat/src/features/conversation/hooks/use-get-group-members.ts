'use client'

import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { getCurrentAccount, useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'

export function createGetGroupMembersQueryOptions(
  accountId?: string,
  conversationId?: string,
  conversationType?: ConversationType
) {
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

export async function getGroupMembers(base: BaseConversation) {
  const account = await getCurrentAccount()

  return queryClient.ensureQueryData(
    createGetGroupMembersQueryOptions(account.address, base.id, base.type as any)
  )
}

export function useGroupMember() {
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()

  return useGetGroupMembers(account?.address, id, type)
}
