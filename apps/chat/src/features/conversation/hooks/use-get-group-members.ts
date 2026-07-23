'use client'

import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { getCurrentAccount, useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'

export function createGetGroupMembersQueryOptions(
  from?: string,
  conversationId?: string,
  conversationType?: ConversationType
) {
  return {
    queryKey: CONVERSATION_QUERY_KEY.GROUP_MEMBERS(conversationId ?? ''),
    queryFn: async () => {
      console.log('createGetGroupMembersQueryOptions', { from, conversationId, conversationType })
      if (!from || !conversationId) return []
      const conversationService = container.conversationService
      const data = await conversationService.getGroupMembers(from, conversationId, conversationType)
      return data
    },
    enabled: !!from && !!conversationId,
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
    createGetGroupMembersQueryOptions(account.hiddenAddress, base.id, base.type as any)
  )
}

export function useGroupMember() {
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()

  return useGetGroupMembers(account?.address, id, type)
}
