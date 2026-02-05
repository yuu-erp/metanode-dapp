import { container } from '@/container'
import { useQuery } from '@tanstack/react-query'

export function useMessagePinStatus(accountId: string, conversationId: string, messageId: string) {
  return useQuery({
    queryKey: ['message-pin-status', accountId, conversationId, messageId],
    queryFn: async () => {
      if (!accountId || !conversationId || !messageId) return false
      return container.messagePinService.isMessagePinned(accountId, conversationId, messageId)
    },
    enabled: !!accountId && !!conversationId && !!messageId
  })
}
