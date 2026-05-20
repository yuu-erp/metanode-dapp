import { container } from '@/container'
import { createGetConversationIdQueryOptions, useCurrentAccount } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export function useSendFileV2(messageType?: string) {
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()

  return useMutation({
    mutationFn: async (payload: any) => {
      if (!account || !id || !type) return
      const conversation = await queryClient.ensureQueryData(
        createGetConversationIdQueryOptions(id, type, false)
      )

      if (!conversation) return
      await container.messageService.sendFile(account, conversation, payload, messageType)
    }
  })
}
