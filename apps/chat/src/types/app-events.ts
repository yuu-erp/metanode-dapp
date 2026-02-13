import type { ConversationType } from '@/modules/conversation'
import type { EventMap } from '@/modules/eventlogs'
import type { Message, MessageStatus, MessageType, PersistedMessage } from '@/modules/message'

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
    fileId?: string
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
  'message.received': {
    sender: string
    recipient: string
    messageId: string
    encryptedContent: string
    type: ConversationType
  }
  'message.partneredited': EventMap['PartnerMessageEdited']
  'message.partnerdeleted': EventMap['PartnerMessageDeleted']
  // GROUP
  'message.editGroup': EventMap['MessageEditedGroup']
  'message.deleteGroup': EventMap['MessageDeletedGroup']
  'reaction.group': EventMap['MessageReactedGroup']

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
    filePath: string
  }
  // GROUP
  'group.created': EventMap['GroupCreated']
  // CALL
  'call.received': EventMap['CallReceived']
}
