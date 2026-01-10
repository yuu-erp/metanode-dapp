import type { Message, MessageStatus } from '@/modules/message'

export type AppEvents = {
  'message.status': {
    accountId: string
    conversationId: string
    clientId: string
    status: MessageStatus
    messageId?: string
  }
  'message.sent': {
    accountId: string
    conversationId: string
    clientId: string
    messageId: string
  }
  'message.create': {
    message: Message
  }
}
