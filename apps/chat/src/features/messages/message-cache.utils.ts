import type { InfiniteData } from '@tanstack/react-query'
import {
  decodeBase64,
  type Message,
  type MessageReaction,
  type MessageStatus
} from '@/modules/message'

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

export function updateMessageStatus(
  oldData: InfiniteData<Message[]> | undefined,
  params: UpdateMessageStatusParams
): InfiniteData<Message[]> | undefined {
  if (!oldData) return oldData

  let updated = false

  const pages = oldData.pages.map((page) =>
    page.map((msg) => {
      const match =
        (params.messageId && msg.id === params.messageId) ||
        (!params.messageId && params.clientId && msg.clientId === params.clientId)

      if (!match) return msg

      updated = true
      return {
        ...msg,
        status: params.status
      }
    })
  )

  if (!updated) return oldData

  return {
    ...oldData,
    pages
  }
}

export function applyMessageSent(
  oldData: InfiniteData<Message[]> | undefined,
  params: ApplyMessageSentParams
): InfiniteData<Message[]> | undefined {
  if (!oldData) return oldData

  let updated = false

  const pages: Message[][] = oldData.pages.map((page) =>
    page.map((msg) => {
      if (msg.clientId !== params.clientId) return msg

      updated = true

      return {
        ...msg,
        messageId: params.messageId,
        status: 'delivered' as MessageStatus
      }
    })
  )

  if (!updated) return oldData

  return {
    ...oldData,
    pages
  }
}

export function applyReactionReceived(
  oldData: InfiniteData<Message[]> | undefined,
  params: ApplyReactionReceivedParams
): InfiniteData<Message[]> | undefined {
  if (!oldData) return oldData

  const emoji = decodeBase64(params.encodedEmoji)
  let updated = false

  const pages = oldData.pages.map((page) =>
    page.map((msg) => {
      if (msg.id !== params.messageId) return msg

      updated = true

      const reactions = msg.reactions ?? []

      const myReaction = reactions.find((r) => r.reactedByMe)
      const opponentReaction = reactions.find((r) => !r.reactedByMe)

      // 🔁 đối phương react trùng emoji của chính họ → noop
      if (opponentReaction?.emoji === emoji) {
        return msg
      }

      // 🧠 nếu mình đã react cùng emoji → gộp count = 2
      if (myReaction?.emoji === emoji) {
        return {
          ...msg,
          reactions: [
            {
              emoji,
              reactedByMe: true,
              count: 2
            }
          ]
        }
      }

      // 🆕 đối phương react emoji khác
      const newReactions: MessageReaction[] = []

      if (myReaction) {
        newReactions.push({
          ...myReaction,
          count: 1
        })
      }

      newReactions.push({
        emoji,
        reactedByMe: false,
        count: myReaction ? 1 : 1
      })

      return {
        ...msg,
        reactions: newReactions
      }
    })
  )

  if (!updated) return oldData

  return {
    ...oldData,
    pages
  }
}

export function applyReactionCreate(
  oldData: InfiniteData<Message[]> | undefined,
  params: {
    messageId: string
    emoji: string
  }
): InfiniteData<Message[]> | undefined {
  if (!oldData) return oldData

  let updated = false

  const pages = oldData.pages.map((page) =>
    page.map((msg) => {
      if (msg.id !== params.messageId) return msg

      updated = true

      const reactions = msg.reactions ?? []

      const myReaction = reactions.find((r) => r.reactedByMe)

      // 🔁 click lại đúng emoji mình đã reaction → noop
      if (myReaction?.emoji === params.emoji) {
        return msg
      }

      // ❌ bỏ reaction cũ của mình (nếu có)
      let nextReactions = reactions
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
      const existing = nextReactions.find((r) => r.emoji === params.emoji)

      if (existing) {
        nextReactions = nextReactions.map((r) =>
          r.emoji === params.emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r
        )
      } else {
        nextReactions.push({
          emoji: params.emoji,
          count: 1,
          reactedByMe: true
        })
      }

      return {
        ...msg,
        reactions: nextReactions
      }
    })
  )

  if (!updated) return oldData

  return {
    ...oldData,
    pages
  }
}
