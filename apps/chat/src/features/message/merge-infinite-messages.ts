import type { InfiniteData } from '@tanstack/react-query'
import type { Message, PersistedMessage } from '@/modules/message'

function isPersistedMessage(msg: Message): msg is PersistedMessage {
  return typeof msg.id === 'string'
}

export function mergeInfiniteMessagesById(
  apiPage: Message[],
  cache?: InfiniteData<Message[]>
): InfiniteData<Message[]> {
  if (!cache) {
    return {
      pages: [apiPage],
      pageParams: [1]
    }
  }

  const map = new Map<string, PersistedMessage>()

  // 1️⃣ cache trước (realtime thắng)
  for (const page of cache.pages) {
    for (const msg of page) {
      if (!isPersistedMessage(msg)) continue
      map.set(msg.id, msg)
    }
  }

  // 2️⃣ api sau
  for (const msg of apiPage) {
    if (!isPersistedMessage(msg)) continue
    if (!map.has(msg.id)) {
      map.set(msg.id, msg)
    }
  }

  // 3️⃣ giữ optimistic message (id undefined)
  const optimistic = cache.pages.flat().filter((m) => !isPersistedMessage(m))

  const sorted = [...map.values(), ...optimistic].sort((a, b) => a.timestamp - b.timestamp)

  const pageSize = cache.pages[0]?.length ?? apiPage.length
  const pages: Message[][] = []

  for (let i = 0; i < sorted.length; i += pageSize) {
    pages.push(sorted.slice(i, i + pageSize))
  }

  return {
    pages,
    pageParams: cache.pageParams
  }
}
