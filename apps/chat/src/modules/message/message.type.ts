export type MessageType = 'text' | 'sticker'

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface BaseMessage {
  id: string // unique message id (có thể từ XMTP id hoặc tx hash)
  type: MessageType
  sender: string // wallet address hoặc ENS
  conversationId?: string // optional - cho group chat hoặc channel
  timestamp: number // Unix timestamp (ms)
  isEdited?: boolean
  isDeleted?: boolean
  status?: MessageStatus
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
