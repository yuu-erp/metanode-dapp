'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message, PersistedMessage } from '@/modules/message'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'

interface UseInfiniteMessagesOptions {
  account?: Account
  conversation?: Conversation
  pageSize?: number
}

function isPersistedMessage(msg: Message): msg is PersistedMessage {
  return typeof msg.id === 'string'
}
/**
 * Hook dùng để infinite scroll tin nhắn (load older messages khi scroll lên)
 */
export function useInfiniteMessages({
  account,
  conversation,
  pageSize = 50
}: UseInfiniteMessagesOptions = {}) {
  const queryKey = MESSAGE_QUERY_KEY.MESSAGES(
    account?.address ?? '',
    conversation?.conversationId ?? ''
  )

  return useInfiniteQuery<Message[], Error, InfiniteData<Message[]>, typeof queryKey, number>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (!account || !conversation) return []
      console.log('pageParam', { pageParam, account, conversation })
      const apiPage = await container.messageService.getProcessedP2PMessages(
        account,
        conversation,
        {
          limit: pageSize,
          page: pageParam
        }
      )

      // 🔥 MERGE THEO ID
      queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (old) => {
        if (!old) {
          return {
            pages: [apiPage],
            pageParams: [pageParam]
          }
        }

        const map = new Map<string, Message>()

        // 1️⃣ cache trước (realtime thắng)
        for (const page of old.pages) {
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

        const sorted = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp)

        const pageSize = old.pages[0]?.length ?? apiPage.length
        const pages: Message[][] = []

        for (let i = 0; i < sorted.length; i += pageSize) {
          pages.push(sorted.slice(i, i + pageSize))
        }

        return {
          pages,
          pageParams: old.pageParams
        }
      })

      // ⚠️ rất quan trọng: vẫn return apiPage
      return apiPage
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length === 0) return undefined
      return (lastPageParam ?? 1) + 1
    },
    enabled: !!account && !!conversation,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })
}
