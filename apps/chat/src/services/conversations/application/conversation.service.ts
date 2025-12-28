import type { Conversation, ConversationRepository } from '../domain'

export class ConversationService {
  constructor(private readonly repository: ConversationRepository) {}

  /**
   * Load conversations for initial UI render
   * (Telegram-style: from local cache)
   */
  async loadInitial(): Promise<Conversation[]> {
    return this.repository.getAllSorted()
  }

  /**
   * Get a conversation detail
   */
  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    return this.repository.getById(conversationId)
  }

  /**
   * Upsert single conversation
   * (used by sync or optimistic update)
   */
  async upsert(conversation: Conversation): Promise<void> {
    await this.repository.upsert(conversation)
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    const conversation = await this.repository.getById(conversationId)

    if (!conversation) return

    await this.repository.upsert({
      ...conversation,
      unreadCount: 0
    })
  }

  /**
   * Clear all conversations
   * (wallet change / logout)
   */
  async clear(): Promise<void> {
    await this.repository.clear()
  }
}
