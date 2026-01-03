export type ConversationType = 'direct' | 'group'

export interface Conversation {
  // Identity
  conversationId: string // primary key
  publicKey: string // public key của conversation (nếu cần cho encryption/identification)
  accountId: string // ← Quan trọng: account/wallet hiện tại sở hữu conversation này

  // UI display (snapshot)
  name: string
  avatar?: string

  // Last message snapshot (cho hiển thị nhanh trong list)
  latestMessageContent: string

  // State
  unreadCount: number
  conversationType: ConversationType

  // Sync / sort
  updatedAt: Date // nên dùng Date hoặc ISO string tùy bạn xử lý
}
