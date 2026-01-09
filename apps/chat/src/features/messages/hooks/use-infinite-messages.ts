'use client'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message } from '@/modules/message'
import { MESSAGE_QUERY_KEY } from '@/shared/lib/react-query'
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'

interface UseInfiniteMessagesOptions {
  account?: Account
  conversation?: Conversation
  pageSize?: number // số tin nhắn mỗi lần load
}

/**
 * Hook dùng để infinite scroll tin nhắn (load older messages khi scroll lên)
 */
export function useInfiniteMessages({
  account,
  conversation,
  pageSize = 50
}: UseInfiniteMessagesOptions = {}) {
  return useInfiniteQuery<
    Message[],
    Error,
    InfiniteData<Message[]>,
    ReturnType<typeof MESSAGE_QUERY_KEY.MESSAGES>,
    number | null // cursor: beforeTimestamp hoặc null (đầu tiên)
  >({
    queryKey: MESSAGE_QUERY_KEY.MESSAGES(
      account?.address ?? '',
      conversation?.conversationId ?? ''
    ),
    queryFn: async ({ pageParam = null }) => {
      if (!account || !conversation) return []

      const messageService = container.messageService
      console.log({ pageParam, pageSize })
      // Gọi service với beforeTimestamp để lấy tin nhắn cũ hơn
      return await messageService.getProcessedP2PMessages(account, conversation, {
        limit: pageSize,
        page: pageParam as number | undefined
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Nếu trang vừa load có ít hơn pageSize → hết dữ liệu
      if (lastPage.length < pageSize) return undefined
      // Trang tiếp theo = trang hiện tại + 1
      return allPages.length + 1
    },
    getPreviousPageParam: () => undefined, // không hỗ trợ load newer ở đây (dùng refetch riêng)
    enabled: !!account && !!conversation,
    staleTime: 1000 * 60 * 5, // 5 phút
    gcTime: 1000 * 60 * 30 // 30 phút (React Query v5 dùng gcTime thay cacheTime)
    // Optional: refetch khi có tin nhắn mới (nếu bạn có event/socket)
    // refetchOnWindowFocus: false,
  })
}
