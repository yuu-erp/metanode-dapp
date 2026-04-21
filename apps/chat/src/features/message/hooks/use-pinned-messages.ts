import { container } from '@/container'
import { useQuery } from '@tanstack/react-query'

export function usePinnedMessages(accountId: string, conversationId: string) {
  return useQuery({
    queryKey: ['pinned-messages', accountId, conversationId],
    queryFn: async () => {
      if (!accountId || !conversationId) return []
      return container.messagePinService.getPinnedMessages(accountId, conversationId)
    },
    enabled: !!accountId && !!conversationId
  })
}
