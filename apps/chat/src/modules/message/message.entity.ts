import type {
  BaseMessage,
  ComposerDraft,
  Message,
  MessageAction,
  PersistedMessage,
  ReplyReference,
  SendPayload
} from '.'

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
        size: payload.size,
        filePath: payload.filePath,
        file: payload.file
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

    case 'system':
      return {
        ...common,
        type: 'system',
        eventName: payload.eventName
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
        size: message.size,
        filePath: message.filePath,
        file: message.file
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

    case 'system':
      return {
        ...common,
        type: 'system',
        eventName: message.eventName
      }
  }
}

export function createForwardPayload(message: PersistedMessage) {
  if (!message.id) {
    throw new Error('Cannot forward message without id')
  }
  const common = {
    forwardFrom: message.sender
  }

  switch (message.type) {
    case 'text':
      return {
        ...common,
        type: 'text',
        content: message.content
      }

    case 'sticker':
      return {
        ...common,
        type: 'sticker',
        stickerId: message.stickerId
      }

    case 'file':
      return {
        ...common,
        type: 'file',
        fileId: message.fileId,
        fileName: message.fileName,
        mimeType: message.mimeType,
        size: message.size
      }

    case 'voice':
      return {
        ...common,
        type: 'voice',
        fileId: message.fileId,
        duration: message.duration,
        mimeType: message.mimeType
      }

    case 'location':
      return {
        ...common,
        type: 'location',
        latitude: message.latitude,
        longitude: message.longitude,
        address: message.address
      }

    case 'system':
      return {
        ...common,
        type: 'system',
        eventName: message.eventName
      }

    default: {
      // đảm bảo exhaustiveness khi thêm MessageType mới
      const _exhaustive: never = message
      return _exhaustive
    }
  }
}

export function createSendPayload(
  draft: ComposerDraft,
  messageAction: MessageAction | undefined = undefined
): SendPayload {
  const replyTo =
    messageAction?.type === 'REPLY' ? createReplyReference(messageAction.message) : undefined

  const forwardFrom = messageAction?.type === 'FORWARD' ? messageAction.message.sender : undefined

  switch (draft.type) {
    case 'text':
      return {
        type: 'text',
        content: draft.content,
        replyTo,
        forwardFrom
      }

    case 'sticker':
      return {
        type: 'sticker',
        stickerId: draft.stickerId,
        replyTo,
        forwardFrom
      }

    case 'file':
      return {
        type: 'file',
        fileId: draft.fileId,
        fileName: draft.fileName,
        mimeType: draft.mimeType,
        size: draft.size,
        replyTo,
        forwardFrom,
        filePath: draft.filePath,
        file: draft.file
      }

    case 'voice':
      return {
        type: 'voice',
        fileId: draft.fileId,
        duration: draft.duration,
        mimeType: draft.mimeType,
        replyTo,
        forwardFrom
      }

    case 'location':
      return {
        type: 'location',
        latitude: draft.latitude,
        longitude: draft.longitude,
        address: draft.address,
        replyTo,
        forwardFrom
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
