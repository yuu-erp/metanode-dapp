import { mapperToMessage } from '@/modules/message'
import type { Conversation, ConversationType } from './conversation.type'

export function mapperToConversation(raw: any): Conversation {
  return {
    conversationId: raw.conversationId,
    publicKey: raw.publicKey,
    accountId: raw.accountId,
    // UI snapshot
    name: raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(' '),
    avatar: raw.avatar ?? undefined,
    username: raw.userName,
    // Last message
    // mapperToMessage returns Message, we need PersistedMessage (Message + id)
    // The raw.lastMessage should ideally have an id. If not, we might need to handle it.
    // Assuming mapperToMessage preserves id if present in raw.
    lastMessage:
      raw.lastMessage && (raw.lastMessage.id || raw.lastMessage.messageId)
        ? {
            ...mapperToMessage(raw.lastMessage),
            id: String(raw.lastMessage.id ?? raw.lastMessage.messageId)
          }
        : undefined,
    // State
    unreadCount: Number(raw.unreadCount ?? 0),
    conversationType: raw.conversationType as ConversationType,
    // Sync / sort
    updatedAt: new Date(Number(raw.lastMessage?.timestamp ?? Math.floor(Date.now() / 1000)))
  }
}
