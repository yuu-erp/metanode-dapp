import type { Message, MessageType, StickerMessage, TextMessage } from './message.type'

/**
 * Mapper từ raw data (từ contract, XMTP, hoặc API) sang Message chuẩn
 * @param raw - Dữ liệu thô (any vì cấu trúc có thể khác nhau tùy nguồn)
 * @returns Message chuẩn theo type định nghĩa
 */
export function mapperToMessage(raw: any): Message {
  const base = {
    id: raw.messageId ?? raw.id ?? String(raw.timestamp ?? Date.now()), // fallback nếu thiếu id
    accountId: raw.accountId ?? raw.from ?? '',
    sender: raw.sender ?? raw.from ?? '',
    recipient: raw.recipient ?? raw.to ?? '',
    timestamp: Number(raw.timestamp ?? Date.now()),
    conversationId: raw.conversationId ?? raw.topic ?? undefined,
    isEdited: Boolean(raw.isEdited ?? raw.editedAt),
    isDeleted: Boolean(raw.isDeleted ?? false),
    status: mapStatus(raw.status ?? raw.isRead)
  }

  const type: MessageType = raw.type === 'sticker' ? 'sticker' : 'text' // default text

  if (type === 'sticker') {
    return {
      ...base,
      type: 'sticker',
      stickerId: raw.stickerId ?? raw.content ?? 'unknown-sticker' // fallback
    } satisfies StickerMessage
  }

  // type === 'text'
  return {
    ...base,
    type: 'text',
    content: raw.content ?? raw.text ?? '' // hỗ trợ nhiều tên field phổ biến
  } satisfies TextMessage
}

/**
 * Helper: map status từ dữ liệu raw
 */
function mapStatus(rawStatus: any): Message['status'] {
  if (typeof rawStatus === 'string') {
    if (['sent', 'delivered', 'read', 'failed'].includes(rawStatus)) {
      return rawStatus as Message['status']
    }
  }

  // Một số nguồn chỉ có isRead (boolean)
  if (rawStatus === true) return 'read'
  if (rawStatus === false) return 'sent'

  // Default
  return 'sent'
}
