import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useMutation } from '@tanstack/react-query'

interface UnReactToMessageVariables {
  account: Account
  conversation: Conversation
  messageId: string
}

export function useUnreactToMessage() {
  return useMutation({
    mutationFn: async ({ account, conversation, messageId }: UnReactToMessageVariables) => {
      return container.messageService.unReactMessage(account, conversation, messageId)
    },
    onSuccess: (_messageId) => {
      console.log('Unreact to message successfully ✅')
    },
    onError: (error) => console.error('Unreact to message error ❌', error)
  })
}
