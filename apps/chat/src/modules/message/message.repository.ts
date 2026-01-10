import type { Message } from './message.type'

export interface MessageRepository {
  /* =======================
   * Query
   * ======================= */
  getMessagesByConversation(
    accountId: string,
    conversationId: string,
    options?: {
      limit?: number
      beforeTimestamp?: number
    }
  ): Promise<Message[]>

  getMessageById(accountId: string, messageId: string): Promise<Message | null>

  getLastMessage(accountId: string, conversationId: string): Promise<Message | null>

  countUnread(accountId: string, conversationId: string): Promise<number>

  /* =======================
   * Mutation
   * ======================= */
  upsert(message: Message): Promise<void>

  upsertMany(messages: Message[]): Promise<void>

  markAsRead(accountId: string, messageIds: string[]): Promise<void>

  updateStatus(accountId: string, messageId: string, status: Message['status']): Promise<void>

  editMessage(accountId: string, messageId: string, content: string): Promise<void>

  deleteMessage(accountId: string, messageId: string): Promise<void>

  /**
   * 🔑 Update message bằng clientId (dùng cho optimistic message)
   * - Khi chưa có on-chain messageId
   * - Sau khi sendMessage thành công / failed
   */
  updateByClientId(accountId: string, clientId: string, patch: Partial<Message>): Promise<void>

  /* =======================
   * Cleanup
   * ======================= */
  clearConversation(accountId: string, conversationId: string): Promise<void>

  clearAccount(accountId: string): Promise<void>
}
