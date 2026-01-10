import Dexie from 'dexie'
import type { MessageDB } from './message.indexeddb'
import type { Message } from '../../message.type'
import type { MessageRepository } from '../../message.repository'

export class DexieMessageRepository implements MessageRepository {
  constructor(private readonly db: MessageDB) {}

  // ── Query Methods ───────────────────────────────────────────────

  /**
   * Lấy messages của conversation (mới nhất trước)
   * Hỗ trợ pagination bằng beforeTimestamp (load older messages)
   */
  async getMessagesByConversation(
    accountId: string,
    conversationId: string,
    options: {
      limit?: number
      beforeTimestamp?: number
    } = {}
  ): Promise<Message[]> {
    const { limit = 50, beforeTimestamp } = options

    let upperBound: [string, string, number | typeof Dexie.maxKey] = [
      accountId,
      conversationId,
      Dexie.maxKey
    ]

    if (beforeTimestamp !== undefined) {
      upperBound = [accountId, conversationId, beforeTimestamp]
    }

    return this.db.messages
      .where('[accountId+conversationId+timestamp]')
      .between(
        [accountId, conversationId, Dexie.minKey], // lower
        upperBound, // upper
        true, // include lower
        beforeTimestamp === undefined // include upper chỉ khi không có beforeTimestamp
      )
      .reverse()
      .limit(limit)
      .toArray()
  }

  async getMessageById(accountId: string, messageId: string): Promise<Message | null> {
    const msg = await this.db.messages.get(messageId)
    // Optional: kiểm tra accountId để tăng bảo mật
    if (msg?.accountId !== accountId) return null
    return msg ?? null
  }

  async getLastMessage(accountId: string, conversationId: string): Promise<Message | null> {
    const msg = await this.db.messages
      .where('[accountId+conversationId+timestamp]')
      .between([accountId, conversationId, Dexie.minKey], [accountId, conversationId, Dexie.maxKey])
      .reverse()
      .limit(1)
      .first()

    return msg ?? null
  }

  async countUnread(accountId: string, conversationId: string): Promise<number> {
    // Giả sử status 'delivered' hoặc 'sent' là chưa đọc
    // Nếu bạn có trường riêng isRead/readAt thì nên dùng filter thay vì
    return this.db.messages
      .where('[accountId+conversationId+status]')
      .anyOf([
        [accountId, conversationId, 'sent'],
        [accountId, conversationId, 'delivered']
      ])
      .count()
  }

  // ── Mutation Methods ─────────────────────────────────────────────

  async upsert(message: Message): Promise<void> {
    await this.db.messages.put(message)
  }

  async upsertMany(messages: Message[]): Promise<void> {
    if (messages.length === 0) return
    await this.db.messages.bulkPut(messages)
  }

  async markAsRead(accountId: string, messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return

    await this.db.messages
      .where('[accountId+id]')
      .anyOf(messageIds.map((id) => [accountId, id]))
      .modify((msg) => {
        msg.status = 'read'
        // Nếu bạn có trường readAt thì thêm:
        // msg.readAt = Date.now();
      })
  }

  async updateStatus(
    accountId: string,
    messageId: string,
    status: Message['status']
  ): Promise<void> {
    await this.db.messages
      .where('[accountId+id]')
      .equals([accountId, messageId])
      .modify((msg) => {
        msg.status = status
      })
  }

  async updateByClientId(
    accountId: string,
    clientId: string,
    patch: Partial<Message>
  ): Promise<void> {
    await this.db.messages
      .where('[accountId+clientId]')
      .equals([accountId, clientId])
      .modify((msg) => {
        Object.assign(msg, patch)
      })
  }

  async editMessage(accountId: string, messageId: string, newContent: string): Promise<void> {
    await this.db.messages
      .where('[accountId+id]')
      .equals([accountId, messageId])
      .modify((msg) => {
        // Chỉ update nếu là text message
        if (msg.type === 'text') {
          msg.content = newContent
          // Optional: thêm trường editedAt nếu có
          // (msg as TextMessage).editedAt = Date.now();
        }
        // Nếu không phải text → không làm gì (hoặc throw error tùy yêu cầu)
      })
  }

  async deleteMessage(accountId: string, messageId: string): Promise<void> {
    // Optional: kiểm tra accountId trước khi xóa
    const msg = await this.db.messages.get(messageId)
    if (msg?.accountId === accountId) {
      await this.db.messages.delete(messageId)
    }
  }

  // ── Cleanup Methods ──────────────────────────────────────────────

  async clearConversation(accountId: string, conversationId: string): Promise<void> {
    await this.db.messages
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .delete()
  }

  async clearAccount(accountId: string): Promise<void> {
    await this.db.messages.where('accountId').equals(accountId).delete()
  }
}
