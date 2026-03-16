import type { ConversationType } from '@/modules/conversation'
import type { EventMap } from '@/modules/eventlogs'
import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
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
  'message.updateGroup': {
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
  'message.editGroup': EventMap['MessageEditedGroup'] & {
    type: ConversationType
  }
  'message.deleteGroup': EventMap['MessageDeletedGroup'] & {
    type: ConversationType
  }

  'message.add': {
    conversationId: string
    message: Message
    conversationType: ConversationType
    isMine: boolean
  }

  'message.updateId': {
    messageId: string
    clientId: string
    conversationId: string
    fileId?: string
  }

  // REACTIONS
  'reaction.create': {
    accountId: string
    conversationId: string
    messageId: string
    emoji: string
  }
  'reaction.received': EventMap['PartnerMessageReacted']

  'reaction.upsert': {
    messageId: string
    conversationId: string
    reactor: string
    emoji: string
    accountId: string
    isMine: boolean
  }

  'reaction.removed': {
    messageId: string
    conversationId: string
    reactor: string
    accountId: string
  }

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
  'group.joined': {
    contractAddress: string
    conversationType: ConversationType
  }

  // CALL
  'call.received': Omit<MeetingViewInput, 'hiddenAddress'>

  //USER
  'user.added': null

  //NOTI
  'noti:add': {
    type: 'message' | 'reaction'
  }

  //ACCOUNT
  'account.logout': null
  //CONVERSATION
  'conversation.delete': null
  //MESSAGE
  'message.read': {
    ids: string[]
    accountId: string
    conversationId: string
  }

  'message.send.bua': {
    conversationId: string
    message: Message
    conversationType: ConversationType
    isMine: boolean
  }
  'message.receive.bua': {
    conversationId: string
    message: Message
    conversationType: ConversationType
    isMine: boolean
  }
}
