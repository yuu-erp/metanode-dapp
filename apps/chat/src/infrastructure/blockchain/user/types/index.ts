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
