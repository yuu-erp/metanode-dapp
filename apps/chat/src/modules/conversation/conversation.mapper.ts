import type { Conversation, ConversationType } from './conversation.type'

export function mapperToConversation(raw: any): Conversation {
  return {
    conversationId: raw.conversationId,
    conversationKey: raw.conversationKey,
    accountId: raw.accountId,
    // UI snapshot
    name: raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(' '),
    avatar: raw.avatar ?? undefined,
    username: raw.userName,
    // Last message
    lastMessage: raw.lastMessage,
    // State
    unreadCount: Number(raw.unreadCount ?? 0),
    conversationType: raw.conversationType as ConversationType,
    // Sync / sort
    updatedAt:
      !raw.latestMessageTimestamp || raw.latestMessageTimestamp === '0'
        ? undefined
        : new Date(Number(raw.latestMessageTimestamp) * 1000)
  }
}
