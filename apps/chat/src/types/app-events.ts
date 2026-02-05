import type { EventMap } from '@/modules/eventlogs'
import type { Message, MessageStatus, PersistedMessage } from '@/modules/message'

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
  'message.update': {
    accountId: string
    conversationId: string
    messageId: string
    message: PersistedMessage
  }
  'message.delete': {
    conversationId: string
    messageId: string
  }
  'message.received': EventMap['MessageReceived']
  'message.partneredited': EventMap['PartnerMessageEdited']
  'message.partnerdeleted': EventMap['PartnerMessageDeleted']
  // REACTIONS
  'reaction.create': {
    accountId: string
    conversationId: string
    messageId: string
    emoji: string
  }
  'reaction.received': EventMap['PartnerMessageReacted']
  // WEBRTC
  'webrtc.datachannel.received': EventMap['DataChannel']
  'message.file.downloaded': {
    fileId: string
    filePath: string
  }
  'file.cached': {
    fileKey: string
  }
  // GROUP
  'group.created': EventMap['GroupCreated']
  // CALL
  'call.received': EventMap['CallReceived']
}
