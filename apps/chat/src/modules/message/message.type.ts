// Phân biệt rõ ràng bằng union type + discriminant ('type')

export type MessageType = 'text' | 'sticker'

export interface BaseMessage {
  id: string // unique message id (có thể từ XMTP id hoặc tx hash)
  type: MessageType
  sender: string // wallet address hoặc ENS
  timestamp: number // Unix timestamp (ms)
  conversationId?: string // optional - cho group chat hoặc channel
  status?: 'sent' | 'delivered' | 'read' | 'failed'
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
