import type { Conversation } from './conversation.type'

export interface ConversationRepository {
  /**
   * Get all conversations (unsorted)
   */
  getAll(): Promise<Conversation[]>
  /**
   * Get conversations sorted by updatedAt DESC
   * (used for chat list like Telegram)
   */
  getAllSorted(): Promise<Conversation[]>

  /**
   * Get a conversation by id
   */
  getById(conversationId: string): Promise<Conversation | undefined>

  /**
   * Insert or update a conversation
   */
  upsert(conversation: Conversation): Promise<void>

  /**
   * Insert or update multiple conversations
   * (used when syncing from indexer / blockchain)
   */
  bulkUpsert(conversations: Conversation[]): Promise<void>

  /**
   * Delete a conversation
   */
  delete(conversationId: string): Promise<void>

  /**
   * Clear all conversations (logout / wallet change)
   */
  clear(): Promise<void>
}
