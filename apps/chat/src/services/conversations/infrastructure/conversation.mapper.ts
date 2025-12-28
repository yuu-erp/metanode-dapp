import type { Conversation } from '@/services/conversations/domain'
import type { ConversationType } from '@/services/conversations/domain/conversation.types'

export function mapToConversation(raw: any): Conversation {
  return {
    // Identity
    conversationId: raw.conversationId,

    // UI snapshot
    name: [raw.firstName, raw.lastName].filter(Boolean).join(' '),

    avatar: raw.avatar || undefined,

    // Last message
    latestMessageContent: raw.latestMessageContent ?? '',

    // State
    unreadCount: Number(raw.unreadCount ?? 0),
    conversationType: raw.conversationType as ConversationType,

    // Sync / sort
    updatedAt: new Date(Number(raw.latestMessageTimestamp ?? Math.floor(Date.now() / 1000)) * 1000)
  }
}
