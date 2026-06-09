import { container } from '@/container'
import { createGetConversationIdQueryOptions, useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export function useSendMessageV2() {
  const { data: account } = useCurrentAccount()
  const params = useConversationParams()

  return useMutation({
    mutationFn: async ({ payload, ...rest }: { payload: any; id?: string; type?: string }) => {
      const id = rest?.id ?? params?.id
      const type = rest?.type ?? params?.type

      console.log('[useSendMessageV2] 1', { payload, id, type, account, params })

      if (!account || !id || !type) return
      const conversation = await queryClient.ensureQueryData(
        createGetConversationIdQueryOptions(id, type, false)
      )

      console.log('[useSendMessageV2] 2', { conversation })

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
