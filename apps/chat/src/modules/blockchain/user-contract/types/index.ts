export interface UserProfileOutput {
  userName: string
  firstName: string
  lastName: string
  avatar: string
  bio: string
}

export interface GetFullInboxOutput {
  name: string
  avatar: string
  firstName: string
  lastName: string
  conversationId: string
  latestMessageContent: string
  latestMessageTimestamp: string
  unreadCount: string
  conversationType: string
}

export interface GetProcessedP2PMessagesInput {
  partnerContractAddress: string
  page: number
  limit: number
}
export interface GetProcessedP2PMessagesOutput {
  messageId: string
  sender: string
  recipient: string
  finalContent: string
  timestamp: string
  isDeleted: boolean
  reactionSummary: string
  isRead: boolean
}

export interface SendMessageInput {
  _recipientContractAddress: string
  _encryptedContentForRecipient: string
  _encryptedContentForSelf: string
}

export interface SendMessageOutput {
  sender: string
  recipient: string
  messageId: string
  encryptedContent: string
  dataStoreAddress: string
  messageNonce: number
}

export interface ReactToMessageInput {
  partnerContract: string
  _messageId: string
  _reaction: string
  _reactionToPartner: string
}

export interface EditMessageInput {
  partnerContract: string
  _messageId: string
  newEncryptedContent: string
  newEncryptedContentForPartner: string
}

export interface DeleteMessageV2Input {
  partnerContract: string
  _messageId: string
}

export interface SendDataChannelInput {
  _recipientContractAddress: string
  sessionId: string
  channelName: string
}

export interface GetMessageByIdInput {
  _messageId: string
}

export interface GetMessageByIdOutput {
  messageId: string
  sender: string
  recipient: string
  encryptedContent: string
  timestamp: string
}

export interface SetMeetingFactoryInput {
  _newMeetingFactoryAddress: string
}
