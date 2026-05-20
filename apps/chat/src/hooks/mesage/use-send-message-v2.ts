import { container } from '@/container'
import { createGetConversationIdQueryOptions, useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { queryClient } from '@/shared/lib/react-query'
import { flowActions } from '@/stores/flow.store'
import { useMutation } from '@tanstack/react-query'

export function useSendMessageV2(input?: { id: string; type: string }) {
  const { data: account } = useCurrentAccount()
  const params = useConversationParams()
  const { id, type } = input ?? params

  return useMutation({
    mutationFn: async (payload: any) => {
      if (!account || !id || !type) return
      const conversation = await queryClient.ensureQueryData(
        createGetConversationIdQueryOptions(id, type, false)
      )

      if (!conversation) return
      if (conversation.conversationType === 'p2p') {
        await container.messageService.sendMessage(account, conversation, payload)
      } else {
        await container.messageService.sendGroupMessae(account, conversation, payload)
      }

      // flowActions.resetCallData()
    }
  })
}
