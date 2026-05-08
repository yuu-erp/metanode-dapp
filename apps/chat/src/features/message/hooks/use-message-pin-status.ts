import { container } from '@/container'
import { useAddress } from '@/shared/hooks/accounts/use-address'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
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

export function useIsPinned(messageId = '') {
  const { address } = useAddress()
  const { id } = useConversationParams()

  return useMessagePinStatus(address, id, messageId)
}
