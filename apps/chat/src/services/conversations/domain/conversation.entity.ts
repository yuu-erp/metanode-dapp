import type { ConversationType } from './conversation.types'

export interface Conversation {
  // Identity
  conversationId: string
  publicKey: string
  // UI display (snapshot)
  name: string
  avatar?: string

  // Last message snapshot
  latestMessageContent: string
  // State
  unreadCount: number
  conversationType: ConversationType

  // Sync / sort
  updatedAt: Date
}
