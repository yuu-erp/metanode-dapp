// features/chats/hooks/useInfiniteMessages.ts
'use client'

import { container } from '@/container'
import type { Message } from '@/modules/message'
import { useInfiniteQuery } from '@tanstack/react-query'

const MESSAGE_LIMIT = 30

type MessagePage = {
  items: Message[]
  page: number
}

type PageParam = number

export function useInfiniteMessages(conversationId: string) {
  return useInfiniteQuery<
    MessagePage, // TQueryFnData
    Error, // TError
    MessagePage, // TData
    readonly unknown[],
    PageParam // 🔥 TPageParam (QUAN TRỌNG)
  >({
    queryKey: ['messages', conversationId],
    enabled: !!conversationId,

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const accountService = container.accountService
      const currentAccount = await accountService.getCurrentAccount()

      if (!currentAccount) {
        throw new Error('No current account')
      }

      const userContract = container.userContract

      const messages = await userContract.getProcessedP2PMessages({
        from: currentAccount.address,
        to: conversationId,
        inputData: {
          partnerContractAddress: conversationId,
          page: pageParam, // ✅ pageParam là number
          limit: MESSAGE_LIMIT
        }
      })

      return {
        items: messages,
        page: pageParam
      }
    },

    getNextPageParam: (lastPage) =>
      lastPage.items.length < MESSAGE_LIMIT ? undefined : lastPage.page + 1,

    staleTime: 10_000,
    refetchOnWindowFocus: false
  })
}
