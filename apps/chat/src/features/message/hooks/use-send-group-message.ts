import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { SendPayload } from '@/modules/message'
import { useMutation } from '@tanstack/react-query'

/**
 * Variables cho mutation
 * – dùng trực tiếp SendPayload (single source of truth)
 */
export interface SendMessageVariables {
  account: Account
  conversation: Conversation
  payload: SendPayload
}

/**
 * Hook gửi message
 */
export function useSendGroupMessage() {
  return useMutation<string, Error, SendMessageVariables>({
    mutationFn: async ({ account, conversation, payload }) => {
      const messageService = container.messageService

      console.log('thanhduy - payload', payload)

      return messageService.sendGroupMessae(account, conversation, payload)
    },

    onMutate: ({ payload }) => {
      console.log('[useSendGroupMessage] sending:', payload.type)
    },

    onSuccess: (messageId, variables) => {
      const { payload } = variables
      console.log('[useSendGroupMessage] Send message successfully ✅', payload.type, messageId)
    },

    onError: (error, variables) => {
      const { payload } = variables
      console.error('[useSendGroupMessage] Send message error ❌', payload.type, error)
    }
  })
}
