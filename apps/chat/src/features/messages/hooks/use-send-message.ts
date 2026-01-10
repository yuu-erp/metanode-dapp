import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useMutation } from '@tanstack/react-query'

type SendTextPayload = {
  type: 'text'
  content: string
}

type SendStickerPayload = {
  type: 'sticker'
  stickerId: string
}

export type SendMessagePayload = SendTextPayload | SendStickerPayload

export async function sendMessage(
  account: Account,
  conversation: Conversation,
  payload: SendMessagePayload
): Promise<string> {
  const messageService = container.messageService
  return await messageService.sendMessage(account, conversation, payload)
}

interface SendMessageVariables {
  account: Account
  conversation: Conversation
  payload: SendMessagePayload
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({ account, conversation, payload }: SendMessageVariables) => {
      return sendMessage(account, conversation, payload)
    },
    onSuccess: (_messageId) => {
      console.log('Send message successfully ✅')
    },
    onError: (error) => console.error('Send message error ❌', error)
  })
}
