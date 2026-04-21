import type { Message } from '../message'

export interface PinnedMessage {
  id?: string
  accountId: string
  conversationId: string
  messageId: string
  pinnedAt: number
  message: Message
}
