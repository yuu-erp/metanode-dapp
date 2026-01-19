export type MessageType = 'text' | 'sticker'

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface MessageReaction {
  emoji: string // 😀 ❤️ 👍
  count: number // tổng số
  reactedByMe?: boolean // mình có reaction emoji này không
  users?: string[] // optional: danh sách sender
}

export interface BaseMessage {
  id?: string // unique message id (có thể từ XMTP id hoặc tx hash)
  clientId: string
  accountId: string // account id
  type: MessageType
  sender: string // wallet address hoặc ENS
  recipient: string
  timestamp: number // Unix timestamp (ms)
  conversationId: string // optional - cho group chat hoặc channel
  isEdited?: boolean
  isDeleted?: boolean
  status?: 'sent' | 'delivered' | 'read' | 'failed'
  reactions?: MessageReaction[]
  // ── Các trường liên quan đến REPLY ──
  replyTo?: ReplyReference // (khuyến nghị) - chứa thông tin preview
}

// Optional: Tách riêng phần reference để dễ quản lý & tiết kiệm băng thông
export interface ReplyReference {
  messageId: string // bắt buộc - id của tin nhắn gốc
  sender: string // wallet address hoặc ENS
  type: MessageType // 'text' | 'sticker' - loại của tin nhắn gốc
  textPreview?: string // chỉ có khi type === 'text' → 60–120 ký tự đầu, hoặc toàn bộ nếu ngắn
  stickerPreview?: string // chỉ có khi type === 'sticker' → chính là stickerId, hoặc tên mô tả "cat-cry-03"
}

// Text message
export interface TextMessage extends BaseMessage {
  type: 'text'
  content: string // plain text hoặc markdown string
}

// Sticker message
export interface StickerMessage extends BaseMessage {
  type: 'sticker'
  stickerId: string // ví dụ: "cat-cry-03", "heart-eyes"
}

// Union type cho toàn bộ message
export type Message = TextMessage | StickerMessage

export type MessageReceived = {
  dataStoreAddress: string
  encryptedContent: string
  messageId: string
  messageNonce: string
  recipient: string
  sender: string
}
