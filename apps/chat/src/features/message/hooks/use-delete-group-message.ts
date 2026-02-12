import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { PersistedMessage } from '@/modules/message'
import { useMutation } from '@tanstack/react-query'

/**
 * Variables cho delete message
 */
interface DeleteMessageVariables {
  account: Account
  conversation: Conversation
  message: PersistedMessage
}

/**
 * Hook delete message (chỉ cho phép text)
 */
export function useDeleteGroupMessage() {
  return useMutation<void, Error, DeleteMessageVariables>({
    mutationFn: async ({ account, conversation, message }) => {
      const messageService = container.messageService
      return messageService.deleteGroupMessage(account, conversation, message)
    },

    onMutate: ({ message }) => {
      console.log('[useDeleteMessage] Delete message ✏️', message.id, message.type)
    },

    onSuccess: (_, { message }) => {
      console.log('[useDeleteMessage] Delete message successfully ✅', message.id)
    },

    onError: (error, { message }) => {
      console.error('[useDeleteMessage] Delete message error ❌', message.id, error)
    }
  })
}
