// ============================================================================
// TYPES - MESSAGE SYSTEM (Type-safe discriminated union)
// ============================================================================

export type MessageType = 'text' | 'sticker' | 'file' | 'voice' | 'location' | 'system'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface MessageReaction {
  emoji: string
  users: string[]
}

// ============================================================================
// PAYLOAD DEFINITIONS

// ============================================================================

export type SystemMessageEventName = 'leave_group'

export interface MessagePayloadMap {
  text: { content: string }
  sticker: { stickerId: string }
  file: {
    fileId: string
    fileName: string
    mimeType: string
    size: number
    filePath: string
    file?: File
  }
  voice: { fileId: string; duration: number; mimeType: string }
  location: { latitude: number; longitude: number; address?: string }
  system: { eventName: SystemMessageEventName }
}

// ============================================================================
// REPLY PREVIEW (chỉ những thông tin cần thiết để hiển thị reply bar)
// ============================================================================

// ─── Map type ───
export type ReplyPreviewMap = {
  [K in MessageType]: MessagePayloadMap[K]
}

// ─── ReplyReference ───
export type ReplyReference<T extends MessageType = MessageType> = {
  messageId: string
  sender: string // hoặc senderId nếu bạn dùng id
  type: T
} & ReplyPreviewMap[T]

// ─── On-Chain ReplyReference (Minimal) ───
export type OnChainReplyReference = {
  messageId: string
  sender: string
}

// ============================================================================
// BASE MESSAGE (các trường chung cho mọi loại message)
// ============================================================================

export interface BaseMessage {
  id?: string // undefined khi là optimistic message (chưa gửi thành công)
  clientId?: string // unique id do client tạo (dùng để match khi server trả về)
  accountId: string
  type: MessageType
  sender: string
  recipient: string // P2P thì là địa chỉ contract user còn nếu là GROUP thì là địa chỉ contract của group
  timestamp: number
  conversationId: string // P2P thì là địa chỉ contract user còn nếu là GROUP thì là địa chỉ contract của group
  isEdited?: boolean
  isDeleted?: boolean
  status?: MessageStatus
  reactions?: MessageReaction[]
  replyTo?: ReplyReference | OnChainReplyReference
  forwardFrom?: string
  isMine?: boolean
}

// ============================================================================
// FINAL MESSAGE TYPE (union discriminated by .type)
// ============================================================================

export type Message =
  | (BaseMessage & { type: 'text' } & MessagePayloadMap['text'])
  | (BaseMessage & { type: 'sticker' } & MessagePayloadMap['sticker'])
  | (BaseMessage & { type: 'file' } & MessagePayloadMap['file'])
  | (BaseMessage & { type: 'voice' } & MessagePayloadMap['voice'])
  | (BaseMessage & { type: 'location' } & MessagePayloadMap['location'])
  | (BaseMessage & { type: 'system' } & MessagePayloadMap['system'])
// Type alias cho message đã có id (dùng khi lưu trữ hoặc reply)
export type PersistedMessage = Message & { id: string }

// ============================================================================
// SEND PAYLOAD (dùng khi gửi message từ client)
// ============================================================================

export interface BaseSendPayload {
  replyTo?: ReplyReference
  forwardFrom?: string
}

export interface BaseOnChainPayload {
  replyTo?: OnChainReplyReference
  forwardFrom?: string
}

export type SendPayload =
  | (BaseSendPayload & { type: 'text' } & MessagePayloadMap['text'])
  | (BaseSendPayload & { type: 'sticker' } & MessagePayloadMap['sticker'])
  | (BaseSendPayload & { type: 'file' } & MessagePayloadMap['file'])
  | (BaseSendPayload & { type: 'voice' } & MessagePayloadMap['voice'])
  | (BaseSendPayload & { type: 'location' } & MessagePayloadMap['location'])
  | (BaseSendPayload & { type: 'system' } & MessagePayloadMap['system'])
export type EditTextPayload = BaseSendPayload & { type: 'text' } & MessagePayloadMap['text']
// ============================================================================
// ON-CHAIN PAYLOAD (khi stringify và lưu lên smart contract)
// ============================================================================

export type OnChainMessagePayload =
  | (BaseOnChainPayload & { type: 'text' } & MessagePayloadMap['text'])
  | (BaseOnChainPayload & { type: 'sticker' } & MessagePayloadMap['sticker'])
  | (BaseOnChainPayload & { type: 'file' } & MessagePayloadMap['file'])
  | (BaseOnChainPayload & { type: 'voice' } & MessagePayloadMap['voice'])
  | (BaseOnChainPayload & { type: 'location' } & MessagePayloadMap['location'])
  | (BaseOnChainPayload & { type: 'system' } & MessagePayloadMap['system'])

export type ComposerDraft =
  | { type: 'text'; content: string }
  | { type: 'sticker'; stickerId: string }
  | {
      type: 'file'
      fileId: string
      fileName: string
      mimeType: string
      size: number
      filePath: string
      file: File
    }
  | { type: 'voice'; fileId: string; duration: number; mimeType: string }
  | { type: 'location'; latitude: number; longitude: number; address?: string }

export type MessageActionType = 'EDIT' | 'REPLY' | 'FORWARD'
export interface MessageAction {
  type: MessageActionType
  message: PersistedMessage
}
