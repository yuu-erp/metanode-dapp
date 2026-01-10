import type { Message, MessageType, StickerMessage, TextMessage } from './message.type'

/**
 * Mapper từ raw data (từ contract, XMTP, hoặc API) sang Message chuẩn
 */
export function mapperToMessage(raw: any): Message {
  const base = {
    id: raw.messageId ?? raw.id ?? String(raw.timestamp ?? Date.now()),

    /**
     * 🔑 clientId dùng cho optimistic message
     * - Ưu tiên raw.clientId
     * - Không tự sinh mới ở mapper (để tránh overwrite)
     */
    clientId: raw.clientId,

    accountId: raw.accountId ?? raw.from ?? '',
    sender: raw.sender ?? raw.from ?? '',
    recipient: raw.recipient ?? raw.to ?? '',
    timestamp: Number(raw.timestamp ?? Date.now()),
    conversationId: raw.conversationId ?? raw.topic ?? undefined,
    isEdited: Boolean(raw.isEdited ?? raw.editedAt),
    isDeleted: Boolean(raw.isDeleted ?? false),
    status: mapStatus(raw.status ?? raw.isRead)
  }

  const type: MessageType = raw.type === 'sticker' ? 'sticker' : 'text'

  if (type === 'sticker') {
    return {
      ...base,
      type: 'sticker',
      stickerId: raw.stickerId ?? raw.content ?? 'unknown-sticker'
    } satisfies StickerMessage
  }

  return {
    ...base,
    type: 'text',
    content: raw.content ?? raw.text ?? ''
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
    }
  | {
      type: 'sticker'
      value: string
    }

export function mapperMessageToOnChain(message: Message): OnChainMessagePayload {
  switch (message.type) {
    case 'text':
      return {
        type: 'text',
        value: message.content
      }

    case 'sticker':
      return {
        type: 'sticker',
        value: message.stickerId
      }

    default: {
      const _exhaustive: never = message
      throw new Error('Unsupported message type')
    }
  }
}
