import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useMutation } from '@tanstack/react-query'

export type ReactToMessagePayload = {
  messageId: string
  emoji: string
}

interface ReactToMessageVariables {
  account: Account
  conversation: Conversation
  payload: ReactToMessagePayload
}

export function useReactToMessage() {
  return useMutation({
    mutationFn: async ({ account, conversation, payload }: ReactToMessageVariables) => {
      const messageService = container.messageService

      if (
        conversation.conversationType === 'group' ||
        conversation.conversationType === 'anonymous_group'
      ) {
        return messageService.reactGroupMessage(account, conversation, payload)
      }
      return messageService.reactToMessage(account, conversation, payload)
    },
    onSuccess: (_messageId) => {
      console.log('React to message successfully ✅')
    },
    onError: (error) => console.error('React to message error ❌', error)
  })
}
