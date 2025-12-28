import type { Conversation } from '../../domain'
import type { ConversationRepository } from '../../domain'
import type { ConversationDB } from './conversation.indexeddb'

export class DexieConversationRepository implements ConversationRepository {
  constructor(private readonly db: ConversationDB) {}

  async getAll(): Promise<Conversation[]> {
    return this.db.conversations.toArray()
  }

  async getAllSorted(): Promise<Conversation[]> {
    return this.db.conversations.orderBy('updatedAt').reverse().toArray()
  }

  async getById(conversationId: string): Promise<Conversation | undefined> {
    return this.db.conversations.get(conversationId)
  }

  async upsert(conversation: Conversation): Promise<void> {
    await this.db.conversations.put(conversation)
  }

  async bulkUpsert(conversations: Conversation[]): Promise<void> {
    if (!conversations.length) return
    await this.db.conversations.bulkPut(conversations)
  }

  async delete(conversationId: string): Promise<void> {
    await this.db.conversations.delete(conversationId)
  }

  async clear(): Promise<void> {
    await this.db.conversations.clear()
  }
}
