import type { EventMap } from '@/modules/eventlogs'
import type { Message, MessageStatus } from '@/modules/message'

export type AppEvents = {
  // MESSAGE
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
  'message.received': EventMap['MessageReceived']
  // REACTIONS
  'reaction.create': {
    accountId: string
    conversationId: string
    messageId: string
    emoji: string
  }
  'reaction.received': EventMap['PartnerMessageReacted']
}
