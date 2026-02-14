import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { EditTextPayload, PersistedMessage } from '@/modules/message'
import { useMutation } from '@tanstack/react-query'

/**
 * Variables cho edit message (TEXT ONLY)
 */
interface EditMessageVariables {
  account: Account
  conversation: Conversation
  messageOld: PersistedMessage
  payload: EditTextPayload
}

/**
 * Hook edit message (chỉ cho phép text)
 */
export function useEditGroupMessage() {
  return useMutation<void, Error, EditMessageVariables>({
    mutationFn: async ({ account, conversation, messageOld, payload }) => {
      // runtime safety (phòng khi ai đó bypass type)
      if (messageOld.type !== 'text') {
        throw new Error('Only text messages can be edited')
      }

      const messageService = container.messageService
      return messageService.editGroupMessage(account, conversation, messageOld, payload)
    },

    onMutate: ({ messageOld, payload }) => {
      console.log('[useEditMessage] editing message ✏️', messageOld.id, payload.type)

      // 👉 sau này bạn đặt optimistic update ở đây
      // return context để rollback nếu cần
    },

    onSuccess: (_, { messageOld }) => {
      console.log('[useEditMessage] Edit message successfully ✅', messageOld.id)
    },

    onError: (error, { messageOld }) => {
      console.error('[useEditMessage] Edit message error ❌', messageOld.id, error)
    }
  })
}
