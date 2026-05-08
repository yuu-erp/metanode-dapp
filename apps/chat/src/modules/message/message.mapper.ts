import { formatAddress } from '@/shared/utils'
import type { ConversationType } from '../conversation'
import type {
  BaseMessage,
  BaseOnChainPayload,
  Message,
  MessageReaction,
  MessageStatus,
  MessageType,
  OnChainMessagePayload,
  OnChainReplyReference,
  ReplyReference
} from './message.type'
import { decodeBase64 } from './utils'
import type { Account } from '../account'

// Helper type để check raw data
type RawMessageSource = Record<string, unknown> & {
  type?: string | MessageType
  value?: unknown
  text?: string
  stickerId?: string
  fileId?: string
  fileName?: string
  mimeType?: string
  size?: number | string
  duration?: number | string
  latitude?: number | string
  longitude?: number | string
  address?: string
  reactionSummary?: any
  isMine?: boolean
  conversationType?: ConversationType
  conversationId?: string
  accountId?: string
  status?: MessageStatus
  account?: Account
  eventName?: string
}

/**
 * Mapper từ raw data (on-chain, XMTP, API, v.v.) → Message type-safe
 * @throws Error nếu dữ liệu không hợp lệ hoặc thiếu thông tin bắt buộc
 */
export function mapperToMessage(raw: RawMessageSource): Message {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid raw message data: not an object')
  }

  const rawType = String(raw.type ?? 'text').toLowerCase()
  const messageType: MessageType = [
    'text',
    'sticker',
    'file',
    'voice',
    'location',
    'system'
  ].includes(rawType)
    ? (rawType as MessageType)
    : 'text'
  const reactions =
    raw.conversationType === 'anonymous_group' || raw.conversationType === 'group'
      ? parseReactionForGroup(raw.reactionSummary)
      : parseReactionSummary(raw.reactionSummary, raw.account!, raw.conversationId)

  // Xây dựng base fields chung
  const base: Omit<BaseMessage, 'type'> = {
    id: String(raw.messageId ?? raw.id ?? raw.clientId ?? Date.now()),
    clientId: String(raw.clientId ?? raw.localId ?? ''),
    accountId: formatAddress(String(raw.accountId ?? raw.from ?? raw.sender ?? '')),
    sender: String(raw.sender ?? raw.from ?? raw.author ?? ''),
    recipient: String(raw.recipient ?? raw.to ?? ''),
    timestamp: Number(raw.timestamp ?? raw.createdAt ?? Date.now()),
    conversationId: formatAddress(String(raw.conversationId ?? raw.topic ?? raw.chatId ?? '')),
    isEdited: Boolean(raw.isEdited ?? raw.edited ?? raw.editedAt),
    isDeleted: Boolean(raw.isDeleted ?? raw.deleted ?? false),
    status: mapStatus(raw.status ?? raw.isRead ?? raw.read),
    reactions,
    replyTo: raw.replyTo ? mapReplyReference(raw.replyTo) : undefined,
    forwardFrom: raw.forwardFrom ? String(raw.forwardFrom) : undefined,
    isMine: raw.isMine
  }

  switch (messageType) {
    case 'text': {
      const content = String(
        raw.value ?? raw.text ?? raw.content ?? '[Tin nhắn không hỗ trợ]'
      ).trim()
      return { ...base, type: 'text', content }
    }

    case 'sticker': {
      const stickerId = String(raw.value ?? raw.stickerId ?? 'unknown-sticker')
      return { ...base, type: 'sticker', stickerId }
    }

    case 'file': {
      const fileId = String(
        raw.fileId ?? (typeof raw.value === 'object' && raw.value ? (raw.value as any).fileId : '')
      )
      if (!fileId) {
        throw new Error('File message missing fileId')
      }
      return {
        ...base,
        type: 'file',
        fileId,
        fileName: String(raw.fileName ?? (raw.value as any)?.fileName ?? 'unnamed'),
        mimeType: String(
          raw.mimeType ?? (raw.value as any)?.mimeType ?? 'application/octet-stream'
        ),
        filePath: String(raw.filePath ?? (raw.value as any)?.filePath ?? ''),
        size: Number(raw.size ?? (raw.value as any)?.size ?? 0)
      }
    }

    case 'voice': {
      const fileId = String(
        raw.fileId ?? (typeof raw.value === 'object' && raw.value ? (raw.value as any).fileId : '')
      )
      if (!fileId) {
        throw new Error('Voice message missing fileId')
      }
      return {
        ...base,
        type: 'voice',
        fileId,
        duration: Number(raw.duration ?? (raw.value as any)?.duration ?? 0),
        mimeType: String(raw.mimeType ?? (raw.value as any)?.mimeType ?? 'audio/*')
      }
    }

    case 'location': {
      const latitude = Number(
        raw.latitude ??
          (typeof raw.value === 'object' && raw.value ? (raw.value as any).latitude : NaN)
      )
      const longitude = Number(
        raw.longitude ??
          (typeof raw.value === 'object' && raw.value ? (raw.value as any).longitude : NaN)
      )

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Location message missing or invalid coordinates')
      }

      return {
        ...base,
        type: 'location',
        latitude,
        longitude,
        address:
          raw.address ??
          (typeof raw.value === 'object' && raw.value ? (raw.value as any).address : undefined)
      }
    }
    case 'system': {
      return { ...base, type: 'system', eventName: raw.eventName || ('' as any) }
    }

    // @ts-ignore // BACKUP CHO CHAT CỦ
    case 'TEXT': {
      const content = String(
        raw.value ?? raw.text ?? raw.content ?? '[Tin nhắn không hỗ trợ]'
      ).trim()
      return { ...base, type: 'text', content }
    }
  }
}

/**
 * Map status từ raw data (hỗ trợ nhiều format khác nhau)
 */
function mapStatus(raw: unknown): MessageStatus | undefined {
  if (typeof raw === 'string' && ['sending', 'sent', 'delivered', 'read', 'failed'].includes(raw)) {
    return raw as MessageStatus
  }
  if (raw === true) return 'read'
  if (raw === false) return 'delivered'
  return 'sent' // default an toàn nhất
}

/**
 * Chuyển Message → format lưu trên chain (sẽ stringify sau)
 */
/**
 * Chuyển Message → format lưu trên chain (sẽ stringify sau)
 * Cấu trúc flatten: type, content/stickerId/fileId/... trực tiếp ở root
 */
export function mapperMessageToOnChain(message: Message): OnChainMessagePayload {
  // Các field chung
  const base: BaseOnChainPayload = {
    ...(message.replyTo && {
      replyTo: {
        messageId: message.replyTo.messageId,
        sender: message.replyTo.sender
      }
    }),
    ...(message.forwardFrom && { forwardFrom: message.forwardFrom })
  }

  switch (message.type) {
    case 'text':
      return {
        ...base,
        type: 'text',
        content: message.content.trim()
      } as OnChainMessagePayload

    case 'sticker':
      return {
        ...base,
        type: 'sticker',
        stickerId: message.stickerId
      } as OnChainMessagePayload

    case 'file':
      return {
        ...base,
        type: 'file',
        fileId: message.fileId,
        fileName: message.fileName,
        mimeType: message.mimeType,
        size: message.size
      } as OnChainMessagePayload

    case 'voice':
      return {
        ...base,
        type: 'voice',
        fileId: message.fileId,
        duration: message.duration,
        mimeType: message.mimeType
      } as OnChainMessagePayload

    case 'location':
      return {
        ...base,
        type: 'location',
        latitude: message.latitude,
        longitude: message.longitude,
        ...(message.address !== undefined && { address: message.address })
      } as OnChainMessagePayload
    case 'system':
      return {
        ...base,
        type: 'system',
        eventName: message.eventName
      } as OnChainMessagePayload
  }
}

export function parseReactionForGroup(
  reactions: { reaction: string; reactor: string }[]
): MessageReaction[] {
  const reactionMap: Record<string, MessageReaction> = {}

  reactions.forEach(({ reaction, reactor }) => {
    if (!reactionMap[reaction]) {
      reactionMap[reaction] = {
        emoji: decodeBase64(reaction),
        users: [reactor]
      }
    } else {
      const obj = reactionMap[reaction]
      obj.users.push(reactor)
    }
  })

  return Object.values(reactionMap)
}

/**
 * Parse reaction summary dạng string (ví dụ: "me:base64emoji,friend:base64emoji2,...")
 */
export function parseReactionSummary(
  summary: string = '',
  account: Account,
  conversationId = ''
): MessageReaction[] {
  if (!summary || typeof summary !== 'string') return []
  const map = new Map<string, MessageReaction>()

  summary.split(',').forEach((item) => {
    const trimmed = item.trim()
    if (!trimmed) return

    const [who, encodedEmoji] = trimmed.split(':')
    if (!encodedEmoji) return

    const emoji = decodeBase64(encodedEmoji.trim())

    const isMe = who.trim().toLowerCase() === 'me'

    let entry = map.get(emoji)
    const newReactor = isMe ? account.contractAddress : conversationId
    if (!entry) {
      entry = { emoji, users: [newReactor] }
    } else {
      entry.users = [...entry.users]
    }
    map.set(emoji, entry)
  })

  const rs = [...map.values()]

  return rs
}

/**
 * Helper: map raw replyTo → ReplyReference
 */
function mapReplyReference(raw: unknown): ReplyReference | OnChainReplyReference | undefined {
  if (!raw || typeof raw !== 'object' || raw === null) return undefined

  const ref = raw as Record<string, unknown>
  const messageId = String(ref.messageId ?? '')
  const sender = String(ref.sender ?? '')

  if (!messageId || !sender) return undefined

  if (typeof ref.type === 'string') {
    return ref as unknown as ReplyReference
  }

  return {
    messageId,
    sender
  }
}
