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
