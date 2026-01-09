import type { Message } from './message.type'

export interface MessageRepository {
  /* =======================
   * Query
   * ======================= */
  /** Lấy messages mới nhất của 1 conversation (mặc định 50) */
  getMessagesByConversation(
    accountId: string,
    conversationId: string,
    options?: {
      limit?: number
      beforeTimestamp?: number // pagination (load older)
    }
  ): Promise<Message[]>

  /** Lấy message theo id */
  getMessageById(accountId: string, messageId: string): Promise<Message | null>

  /** Lấy message cuối cùng của conversation */
  getLastMessage(accountId: string, conversationId: string): Promise<Message | null>

  /** Đếm số message chưa đọc */
  countUnread(accountId: string, conversationId: string): Promise<number>

  /* =======================
   * Mutation
   * ======================= */
  /** Insert hoặc update message */
  upsert(message: Message): Promise<void>

  /** Insert/update nhiều message (sync, batch) */
  upsertMany(messages: Message[]): Promise<void>

  /** Đánh dấu message đã đọc */
  markAsRead(accountId: string, messageIds: string[]): Promise<void>

  /** Update status: sent → delivered → read → failed */
  updateStatus(accountId: string, messageId: string, status: Message['status']): Promise<void>

  /** Sửa nội dung message */
  editMessage(accountId: string, messageId: string, content: string): Promise<void>

  /** Soft delete message */
  deleteMessage(accountId: string, messageId: string): Promise<void>

  /* =======================
   * Cleanup
   * ======================= */

  /** Xóa toàn bộ message của 1 conversation */
  clearConversation(accountId: string, conversationId: string): Promise<void>

  /** Xóa toàn bộ message của 1 account */
  clearAccount(accountId: string): Promise<void>
}
