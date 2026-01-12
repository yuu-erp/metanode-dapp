import type {
  BaseMessage,
  Message,
  MessageType,
  ReplyReference,
  StickerMessage,
  TextMessage
} from './message.type'

/**
 * Mapper từ raw data (từ contract, XMTP, hoặc API) sang Message chuẩn
 */
export function mapperToMessage(raw: any): Message {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid raw message data')
  }

  const type: MessageType = raw.type === 'sticker' ? 'sticker' : 'text'

  const base: Omit<BaseMessage, 'type'> = {
    id: raw.messageId ?? raw.id ?? String(raw.timestamp ?? Date.now()),
    clientId: raw.clientId,
    accountId: raw.accountId ?? raw.from ?? '',
    sender: raw.sender ?? raw.from ?? '',
    recipient: raw.recipient ?? raw.to ?? '',
    timestamp: Number(raw.timestamp ?? Date.now()),
    conversationId: raw.conversationId ?? raw.topic ?? '',
    isEdited: Boolean(raw.isEdited ?? raw.editedAt),
    isDeleted: Boolean(raw.isDeleted ?? false),
    status: mapStatus(raw.status ?? raw.isRead),
    replyTo: raw.replyTo // 🔑 đọc trực tiếp từ on-chain / API
  }

  if (type === 'sticker') {
    return {
      ...base,
      type: 'sticker',
      stickerId: String(raw.value ?? raw.stickerId ?? 'unknown-sticker')
    } satisfies StickerMessage
  }

  return {
    ...base,
    type: 'text',
    content: String(raw.value ?? raw.text ?? '[Tin nhắn không hổ trợ]')
  } satisfies TextMessage
}

/**
 * Helper: map status từ dữ liệu raw
 */
function mapStatus(rawStatus: string | boolean): Message['status'] {
  if (typeof rawStatus === 'string') {
    if (['sent', 'delivered', 'read', 'failed'].includes(rawStatus)) {
      return rawStatus as Message['status']
    }
  }

  // Một số nguồn chỉ có isRead (boolean)
  if (rawStatus === true) return 'read'
  if (rawStatus === false) return 'delivered'

  // Default
  return 'sent'
}

export type OnChainMessagePayload =
  | {
      type: 'text'
      value: string
      replyTo?: ReplyReference // (khuyến nghị) - chứa thông tin preview
    }
  | {
      type: 'sticker'
      value: string
      replyTo?: ReplyReference // (khuyến nghị) - chứa thông tin preview
    }

export function mapperMessageToOnChain(message: Message): OnChainMessagePayload {
  const payload: OnChainMessagePayload = {
    type: message.type,
    value: message.type === 'text' ? message.content.trim() : message.stickerId
  }

  if (message.replyTo) {
    payload.replyTo = message.replyTo
  }

  return payload
}

export function messageToReplyReference(message: Message): ReplyReference {
  const ref: ReplyReference = {
    messageId: message.id!,
    sender: message.sender,
    type: message.type
  }

  if (message.type === 'text') {
    const preview = message.content.trim()
    if (preview) {
      ref.textPreview = preview.slice(0, 120)
    }
  }

  if (message.type === 'sticker') {
    if (message.stickerId) {
      ref.stickerPreview = message.stickerId
    }
  }

  return ref
}
