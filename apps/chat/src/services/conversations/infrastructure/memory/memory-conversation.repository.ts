import type { Conversation, ConversationRepository } from '../../domain'

export class MemoryConversationRepository implements ConversationRepository {
  private store = new Map<string, Conversation>()

  async getAll(): Promise<Conversation[]> {
    return Array.from(this.store.values())
  }

  async getAllSorted(): Promise<Conversation[]> {
    return Array.from(this.store.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getById(conversationId: string): Promise<Conversation | undefined> {
    return this.store.get(conversationId)
  }

  async upsert(conversation: Conversation): Promise<void> {
    this.store.set(conversation.conversationId, conversation)
  }

  async bulkUpsert(conversations: Conversation[]): Promise<void> {
    for (const c of conversations) {
      this.store.set(c.conversationId, c)
    }
  }

  async delete(conversationId: string): Promise<void> {
    this.store.delete(conversationId)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }
}
