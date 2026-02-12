import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useMutation } from '@tanstack/react-query'

export type ReactToMessagePayload = {
  messageId: string
  emoji: string
}

async function reactToMessage(
  account: Account,
  conversation: Conversation,
  payload: ReactToMessagePayload
): Promise<void> {
  const messageService = container.messageService
  return await messageService.reactToMessage(account, conversation, payload)
}

interface ReactToMessageVariables {
  account: Account
  conversation: Conversation
  payload: ReactToMessagePayload
}

export function useReactToMessage() {
  return useMutation({
    mutationFn: async ({ account, conversation, payload }: ReactToMessageVariables) => {
      return reactToMessage(account, conversation, payload)
    },
    onSuccess: (_messageId) => {
      console.log('React to message successfully ✅')
    },
    onError: (error) => console.error('React to message error ❌', error)
  })
}
