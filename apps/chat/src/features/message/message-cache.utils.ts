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

interface ApplyReactionReceivedParams {
  messageId: string
  encodedEmoji: string
  reactedByMe: boolean
}

export function insertMessage(
  oldData: InfiniteData<Message[]> | undefined,
  message: Message
): InfiniteData<Message[]> {
  if (!oldData) {
    return {
      pageParams: [undefined],
      pages: [[message]]
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
  params: ApplyMessageSentParams
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { clientId: params.clientId })) return msg
    return { ...msg, id: params.messageId, status: 'delivered' }
  })
}

export function applyMessageUpdate(
  old: InfiniteData<Message[]> | undefined,
  params: { messageId: string; message: PersistedMessage }
): InfiniteData<Message[]> | undefined {
  return updatePages(old, (msg) => {
    if (!matchMessage(msg, { messageId: params.messageId })) return msg
    return { ...msg, ...params.message }
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

// Reaction helper (common logic for both create and received, adjusted for isMe)
function handleReaction(
  reactions: MessageReaction[] | undefined,
  emoji: string,
  isMe: boolean
): MessageReaction[] {
  const currentReactions = reactions ?? []

  if (isMe) {
    // Logic for applyReactionCreate (me reacting)
    const myReaction = currentReactions.find((r) => r.reactedByMe)

    // 🔁 click lại đúng emoji mình đã reaction → noop
    if (myReaction?.emoji === emoji) {
      return currentReactions
    }

    // ❌ bỏ reaction cũ của mình (nếu có)
    let nextReactions = currentReactions
      .map((r) => {
        if (r.reactedByMe) {
          // giảm count emoji cũ
          if (r.count > 1) {
            return { ...r, count: r.count - 1, reactedByMe: false }
          }
          return null
        }
        return r
      })
      .filter(Boolean) as MessageReaction[]

    // ✅ thêm / tăng emoji mới
    const existing = nextReactions.find((r) => r.emoji === emoji)

    if (existing) {
      nextReactions = nextReactions.map((r) =>
        r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r
      )
    } else {
      nextReactions.push({
        emoji,
        count: 1,
        reactedByMe: true,
        users: []
      })
    }

    return nextReactions
  } else {
    // Logic for applyReactionReceived (opponent reacting)
    const myReaction = currentReactions.find((r) => r.reactedByMe)
    const opponentReaction = currentReactions.find((r) => !r.reactedByMe)

    // 🔁 đối phương react trùng emoji của chính họ → noop
    if (opponentReaction?.emoji === emoji) {
      return currentReactions
    }

    // 🧠 nếu mình đã react cùng emoji → gộp count = 2
    if (myReaction?.emoji === emoji) {
      return [
        {
          emoji,
          reactedByMe: true,
          count: 2,
          users: []
        }
      ]
    }

    // 🆕 đối phương react emoji khác
    const newReactions: MessageReaction[] = []

    if (myReaction) {
      newReactions.push({
        ...myReaction,
        count: 1,
        users: []
      })
    }

    newReactions.push({
      emoji,
      reactedByMe: false,
      count: myReaction ? 1 : 1,
      users: []
    })

    return newReactions
  }
}

export function applyReactionReceived(
  oldData: InfiniteData<Message[]> | undefined,
  params: ApplyReactionReceivedParams
): InfiniteData<Message[]> | undefined {
  const emoji = decodeBase64(params.encodedEmoji)
  const isMe = params.reactedByMe // Sử dụng param để quyết định logic (dù code gốc assume false, nhưng để linh hoạt)

  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { messageId: params.messageId })) return msg
    const newReactions = handleReaction(msg.reactions, emoji, isMe)
    if (newReactions === msg.reactions) return msg // Optional: avoid update if no change
    return { ...msg, reactions: newReactions }
  })
}

export function applyReactionCreate(
  oldData: InfiniteData<Message[]> | undefined,
  params: {
    messageId: string
    emoji: string
  }
): InfiniteData<Message[]> | undefined {
  return updatePages(oldData, (msg) => {
    if (!matchMessage(msg, { messageId: params.messageId })) return msg
    const newReactions = handleReaction(msg.reactions, params.emoji, true)
    if (newReactions === msg.reactions) return msg // Optional: avoid update if no change
    return { ...msg, reactions: newReactions }
  })
}
