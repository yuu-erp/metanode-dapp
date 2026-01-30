import type { ConversationDB } from '.'
import type { ConversationRepository } from '../../conversation.repository'
import type { Conversation } from '../../conversation.type'

export class DexieConversationRepository implements ConversationRepository {
  constructor(private readonly db: ConversationDB) {}

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async getByAccount(accountId: string): Promise<Conversation[]> {
    return this.db.conversations.where('accountId').equals(accountId).toArray()
  }

  async getSortedByAccount(accountId: string): Promise<Conversation[]> {
    // 1️⃣ Lấy Saved Messages (private)
    const privateConversations = await this.db.conversations
      .where('accountId')
      .equals(accountId)
      .and((c) => c.conversationType === 'private')
      .toArray()

    // 2️⃣ Lấy các conversation còn lại, sort theo updatedAt desc
    const normalConversations = await this.db.conversations
      .where('[accountId+updatedAt]')
      .between([accountId, new Date(0)], [accountId, new Date(8640000000000000)])
      .reverse()
      .and((c) => c.conversationType !== 'private')
      .toArray()

    // 3️⃣ Gộp lại: private luôn ở trên
    return [...privateConversations, ...normalConversations]
  }

  async getById(accountId: string, conversationId: string): Promise<Conversation | undefined> {
    return this.db.conversations
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .first()
  }

  // ------------------------------------------------------------------
  // WRITE
  // ------------------------------------------------------------------
  async upsert(conversation: Conversation): Promise<void> {
    this.assertAccount(conversation.accountId)
    await this.db.conversations.put(conversation)
  }

  async bulkUpsert(conversations: Conversation[]): Promise<void> {
    if (!conversations.length) return

    conversations.forEach((c) => this.assertAccount(c.accountId))
    await this.db.conversations.bulkPut(conversations)
  }

  // ------------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------------
  async delete(accountId: string, conversationId: string): Promise<void> {
    await this.db.conversations
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .delete()
  }

  async clearByAccount(accountId: string): Promise<void> {
    await this.db.conversations.where('accountId').equals(accountId).delete()
  }

  // ------------------------------------------------------------------
  // Guard
  // ------------------------------------------------------------------
  private assertAccount(accountId?: string): asserts accountId is string {
    if (!accountId) {
      throw new Error('Conversation must have accountId')
    }
  }
}
