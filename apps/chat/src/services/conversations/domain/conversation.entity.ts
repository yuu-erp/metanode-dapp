import type { MessageStatus } from '@/services/message/domain'
import type { ConversationType } from './conversation.types'

export interface Conversation {
  // Identity
  conversationId: string

  // UI display (snapshot)
  name: string
  avatar?: string

  // Last message snapshot
  latestMessageContent: string
  lastMessageStatus?: MessageStatus // <-- bổ sung

  // State
  unreadCount: number
  conversationType: ConversationType

  // Sync / sort
  updatedAt: Date
}
