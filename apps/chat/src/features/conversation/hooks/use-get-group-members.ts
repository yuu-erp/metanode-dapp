'use client'

import { container } from '@/container'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createGetGroupMembersQueryOptions(
  accountId?: string,
  conversationId?: string
): UseQueryOptions<any[], Error, any[], ReturnType<typeof CONVERSATION_QUERY_KEY.GROUP_MEMBERS>> {
  return {
    queryKey: CONVERSATION_QUERY_KEY.GROUP_MEMBERS(conversationId ?? ''),
    queryFn: async () => {
      if (!accountId || !conversationId) return []
      const conversationService = container.conversationService
      return await conversationService.getGroupMembers(accountId, conversationId)
    },
    enabled: !!accountId && !!conversationId
  }
}

export function useGetGroupMembers(accountId?: string, conversationId?: string) {
  return useQuery(createGetGroupMembersQueryOptions(accountId, conversationId))
}
