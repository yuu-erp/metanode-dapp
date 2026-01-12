import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { ReplyReference } from '@/modules/message'
import { useMutation } from '@tanstack/react-query'

type SendTextPayload = {
  type: 'text'
  content: string
  replyTo?: ReplyReference
}

type SendStickerPayload = {
  type: 'sticker'
  stickerId: string
  replyTo?: ReplyReference
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
