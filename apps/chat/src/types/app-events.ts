import type { Message, MessageReceived, MessageStatus } from '@/modules/message'

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
    encryptContent: string
  }
  'message.create': {
    message: Message
  }
  'message:received': MessageReceived
  // REACTION
  'message.reaction.create': {
    accountId: string
    conversationId: string
    messageId: string
    reaction: string
  }

  'message.reaction.status': {
    accountId: string
    conversationId: string
    messageId: string
    reaction: string
    status: 'pending' | 'success' | 'failed'
  }

  'message.reaction.received': {
    messageId: string
    sender: string
    recipient: string
    reactor: string
    reaction: string
  }
}
