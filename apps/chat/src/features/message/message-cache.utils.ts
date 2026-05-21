import type { InfiniteData } from '@tanstack/react-query'
import {
  type Message,
  type MessageReaction,
  type MessageStatus,
  type PersistedMessage
} from '@/modules/message'
import { decodeBase64 } from '@/modules/message/utils'

function isSameMessage(a: Message, b: Message) {
  // 1️⃣ ưu tiên clientId (optimistic)
  if (a.clientId && b.clientId) {
    return a.clientId === b.clientId
  }

  // 2️⃣ fallback messageId (on-chain)
  if (a.id && b.id) {
    return a.id === b.id
  }

  return false
}

interface UpdateMessageStatusParams {
  messageId?: string
  clientId?: string
  status: MessageStatus
}

interface ApplyMessageSentParams {
  clientId: string
  messageId: string
}

export function insertMessage(
  oldData: InfiniteData<Message[]> | undefined,
  message: Message
): InfiniteData<Message[]> {
  if (!oldData || !oldData.pages || oldData.pages.length === 0) {
    return {
      pageParams: [],
      pages: []
    }
  }

  const firstPage = oldData.pages[0] ?? []

  const isDuplicate = firstPage.some((m) => isSameMessage(m, message))
  if (isDuplicate) {
    return oldData
  }

  return {
    ...oldData,
    pages: [[message, ...firstPage], ...oldData.pages.slice(1)]
  }
}

export function applyMessageUpsert(
  oldData: InfiniteData<Message[]> | undefined,
  message: Partial<Message>,
  clientId?: string
) {
  return updatePages(oldData, (msg: any) => {
    if (!matchMessage(msg, { clientId, messageId: message.id })) return msg

    const newMessage = { ...msg, ...message, sender: message.sender || msg.sender }
    return newMessage
  })
}

export function applyUpdateMessageId(
  oldData: InfiniteData<Message[]> | undefined,
  messageId: string,
  clientId: string,
  fileId?: string
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { clientId: clientId })) return msg
    const newMsg = { ...msg, id: messageId, status: 'delivered' } as Message // Cast to avoid strict type issues with status literal
    if (fileId && (newMsg.type === 'file' || newMsg.type === 'voice')) {
      newMsg.fileId = fileId
    }
    return newMsg
  })
}

// Helpers
function updatePages(
  oldData: InfiniteData<Message[]> | undefined,
  updater: (msg: Message) => Message | null // null để delete
): InfiniteData<Message[]> | undefined {
  if (!oldData) return oldData

  let updated = false
  const pages = oldData.pages.map((page) => {
    const newPage = page.map(updater).filter((msg): msg is Message => msg !== null)
    if (newPage.length !== page.length || newPage.some((m, i) => m !== page[i])) {
      updated = true
    }
    return newPage
  })
  return updated ? { ...oldData, pages } : oldData
}

function matchMessage(
  msg: Message,
  { messageId, clientId }: { messageId?: string; clientId?: string }
) {
  return (messageId && msg.id === messageId) || (clientId && msg.clientId === clientId)
}

// Refactored functions using helpers
export function updateMessageStatus(
  oldData: InfiniteData<Message[]> | undefined,
  params: UpdateMessageStatusParams
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, params)) return msg
    return { ...msg, status: params.status }
  })
}

export function applyMessageSent(
  oldData: InfiniteData<Message[]> | undefined,
  params: ApplyMessageSentParams & { fileId?: string }
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { clientId: params.clientId })) return msg
    const newMsg = { ...msg, id: params.messageId, status: 'delivered' } as Message // Cast to avoid strict type issues with status literal
    if (params.fileId && newMsg.type === 'file') {
      newMsg.fileId = params.fileId
    }
    return newMsg
  })
}

export function applyMessageUpdate(
  old: InfiniteData<Message[]> | undefined,
  params: { messageId: string; message: PersistedMessage }
): InfiniteData<Message[]> | undefined {
  return updatePages(old, (msg) => {
    // 1. Update chính message đó

    if (matchMessage(msg, { messageId: params.messageId })) {
      return { ...msg, ...params.message }
    }

    // 2. Update các message đang reply message đó (Cascade Update)
    if (
      msg.replyTo &&
      msg.replyTo.messageId === params.messageId &&
      params.message.type === 'text'
    ) {
      // Chỉ update nếu reply reference cũng đang lưu dạng text (có field content)
      if ('content' in msg.replyTo) {
        return {
          ...msg,
          replyTo: {
            ...msg.replyTo,
            content: params.message.content
          } as any
        }
      }
    }

    return msg
  })
}

export function applyMessageDelete(
  old: InfiniteData<Message[]> | undefined,
  params: { messageId: string }
): InfiniteData<Message[]> | undefined {
  return updatePages(old, (msg) => {
    if (matchMessage(msg, { messageId: params.messageId })) return null
    return msg
  })
}

function handleRemoveReaction(
  reactions: MessageReaction[] | undefined,
  reactor: string
): MessageReaction[] {
  if (!reactions) return []

  const next: MessageReaction[] = []

  for (const r of reactions) {
    const userIndex = r.users.findIndex((u) => u === reactor)

    // reaction này không liên quan
    if (userIndex === -1) {
      next.push(r)
      continue
    }

    const newUsers = r.users.filter((u) => u !== reactor)

    // nếu không còn ai reaction emoji này nữa
    if (newUsers.length <= 0) {
      continue
    }

    next.push({
      ...r,
      users: newUsers
    })
  }

  return next
}

export function applyReactionRemoved(
  oldData: InfiniteData<Message[]> | undefined,
  params: {
    messageId: string
    conversationId: string
    reactor: string
  }
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { messageId: params.messageId })) return msg

    const newReactions = handleRemoveReaction(msg.reactions, params.reactor)

    if (newReactions === msg.reactions) return msg

    return { ...msg, reactions: newReactions }
  })
}

export function applyReactionUpsert(
  oldData: InfiniteData<Message[]> | undefined,
  params: {
    messageId: string
    reactor: string
    emoji: string
    isMine: boolean
  }
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { messageId: params.messageId })) return msg

    const reactions = msg.reactions ?? []
    const { reactor } = params
    const emoji = decodeBase64(params.emoji)

    let changed = false
    let next: MessageReaction[] = []

    // 1️⃣ remove old reaction of this reactor (if any)
    for (const r of reactions) {
      if (!r.users.includes(reactor)) {
        next.push(r)
        continue
      }

      // 🔁 same emoji → noop
      if (r.emoji === emoji) {
        return msg
      }

      changed = true

      const newUsers = r.users.filter((u) => u !== reactor)

      // nếu vẫn còn người khác giữ emoji này
      if (newUsers.length > 0) {
        next.push({
          ...r,
          users: newUsers
        })
      }

      // nếu không còn ai → drop reaction luôn
    }

    // 2️⃣ add / merge new emoji
    const existingIndex = next.findIndex((r) => r.emoji === emoji)

    if (existingIndex !== -1) {
      const existing = next[existingIndex]

      next[existingIndex] = {
        ...existing,
        users: [...existing.users, reactor]
      }

      changed = true
    } else {
      next.push({
        emoji,
        users: [reactor]
      })

      changed = true
    }

    if (!changed) return msg

    return {
      ...msg,
      reactions: next
    }
  })
}

export function updateMessageFilePath(
  oldData: InfiniteData<Message[]> | undefined,
  params: {
    fileKey: string
    filePath: string
  }
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (msg.type === 'file' && msg.fileId === params.fileKey) {
      return { ...msg, filePath: params.filePath }
    }
    return msg
  })
}
