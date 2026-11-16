import type { ConversationType } from '@/modules/conversation'
import type { SendPayload } from '@/modules/message'
import { handleSendMessage } from '@/new/message/send-message-v4'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { ACTIONS_QUERY_KEY } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export type SendMessageVariables = {
  payload: SendPayload
  id?: string
  type?: ConversationType | BaseConversation['type']
}

/**
 * Hook gửi tin — core: `handleSendMessage` (`new/message`, luồng B).
 */
export function useSendMessage() {
  const params = useConversationParams()

  return useMutation({
    mutationKey: ACTIONS_QUERY_KEY.sendMessage,
    mutationFn: async ({ payload, ...rest }: SendMessageVariables) => {
      const id = rest?.id ?? params?.id
      const type = rest?.type ?? params?.type

      if (!id || !type) return

      return handleSendMessage({ ...payload }, { id, type })
    },
  })
}
