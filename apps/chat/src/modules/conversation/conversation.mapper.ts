import type { Conversation, ConversationType } from './conversation.type'

export function mapperToConversation(raw: any): Conversation {
  return {
    conversationId: raw.conversationId,
    publicKey: raw.publicKey,
    accountId: raw.accountId,
    // UI snapshot
    name: [raw.firstName, raw.lastName].filter(Boolean).join(' '),
    avatar: raw.avatar ?? undefined,
    username: raw.userName,
    // Last message
    latestMessageContent: raw.latestMessageContent ?? '',
    // State
    unreadCount: Number(raw.unreadCount ?? 0),
    conversationType: raw.conversationType as ConversationType,
    // Sync / sort
    updatedAt: new Date(Number(raw.latestMessageTimestamp ?? Math.floor(Date.now() / 1000)) * 1000)
  }
}
