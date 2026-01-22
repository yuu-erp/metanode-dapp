import type { BaseMessage, Message, PersistedMessage, ReplyReference, SendPayload } from '.'

export function createOptimisticMessage(
  base: Omit<BaseMessage, 'type' | 'status'>,
  payload: SendPayload
): Message {
  // Tạo base chung, KHÔNG gán type BaseMessage ở đây
  const common: Omit<BaseMessage, 'type'> = {
    ...base,
    status: 'sending',
    reactions: base.reactions ?? [] // phòng trường hợp base.reactions undefined
  }

  switch (payload.type) {
    case 'text':
      return {
        ...common,
        type: 'text',
        content: payload.content
      } satisfies Message // hoặc bỏ satisfies nếu TS version cũ

    case 'sticker':
      return {
        ...common,
        type: 'sticker',
        stickerId: payload.stickerId
      } satisfies Message

    case 'file':
      return {
        ...common,
        type: 'file',
        fileId: payload.fileId,
        fileName: payload.fileName,
        mimeType: payload.mimeType,
        size: payload.size
      } satisfies Message

    case 'voice':
      return {
        ...common,
        type: 'voice',
        fileId: payload.fileId,
        duration: payload.duration,
        mimeType: payload.mimeType
      } satisfies Message

    case 'location':
      return {
        ...common,
        type: 'location',
        latitude: payload.latitude,
        longitude: payload.longitude,
        ...(payload.address !== undefined && { address: payload.address })
      } satisfies Message
  }
}

export function createReplyReference(message: PersistedMessage): ReplyReference {
  // Vì reply cần message đã có id
  if (!message.id) {
    throw new Error('Cannot create ReplyReference: message.id is missing')
  }

  const common = {
    messageId: message.id,
    sender: message.sender,
    type: message.type
  }

  switch (message.type) {
    case 'text':
      return { ...common, content: message.content }

    case 'sticker':
      return { ...common, stickerId: message.stickerId }

    case 'file':
      return {
        ...common,
        fileId: message.fileId,
        fileName: message.fileName,
        mimeType: message.mimeType,
        size: message.size
      }

    case 'voice':
      return {
        ...common,
        fileId: message.fileId,
        duration: message.duration,
        mimeType: message.mimeType
      }

    case 'location':
      return {
        ...common,
        latitude: message.latitude,
        longitude: message.longitude,
        address: message.address
      }
  }
}

// ============================================================================
// TYPE GUARDS (rất hữu ích khi xử lý runtime)
// ============================================================================

export function isTextMessage(msg: Message): msg is Message & { type: 'text' } {
  return msg.type === 'text'
}

export function isFileMessage(msg: Message): msg is Message & { type: 'file' } {
  return msg.type === 'file'
}

export function isVoiceMessage(msg: Message): msg is Message & { type: 'voice' } {
  return msg.type === 'voice'
}

export function isLocationMessage(msg: Message): msg is Message & { type: 'location' } {
  return msg.type === 'location'
}
