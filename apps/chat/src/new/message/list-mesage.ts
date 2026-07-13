import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import { getCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { fulfilledPromises } from '@/shared/utils'
import { infiniteQueryOptions, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import React from 'react'
import {
  baseMessageToMessage,
  groupMessageToBaseMessage,
  p2pMessageToBaseMessage
} from './message.utils'
import { setMessageInfo } from './message-info'

export type PageLimit = { limit?: number; page?: number }

async function getMessaeges(
  converstaion: BaseConversation,
  { page = 1, limit = 50 }: PageLimit = {}
): Promise<BaseMessage[]> {
  const { id, type } = converstaion
  const account = await getCurrentAccount()
  switch (type) {
    case 'p2p': {
      const rs = await container.userContract.getProcessedP2PMessages({
        from: account.address,
        to: account.contractAddress,
        inputData: {
          partnerContractAddress: id,
          limit,
          page
        }
      })

      return await Promise.all(rs.map(p2pMessageToBaseMessage))
    }
    case 'group': {
      const rs = await container.groupContract.getProcessedGroupMessages({
        from: account.address,
        to: id,
        inputData: {
          limit,
          page
        }
      })
      return await Promise.all(rs.map((message) => groupMessageToBaseMessage(message)))
    }

    case 'anonymous_group': {
      const rs = await container.anonymousGroupContract.getProcessedGroupMessagesWithReactions({
        from: account.address,
        to: id,
        inputData: {
          limit,
          page,
          sender: account.address
        }
      })
      return await Promise.all(rs.map((message) => groupMessageToBaseMessage(message, true)))
    }

    case 'private': {
      const rs = await container.userContract.getProcessedP2PMessages({
        from: account.address,
        to: account.contractAddress,
        inputData: {
          partnerContractAddress: account.contractAddress,
          limit,
          page
        }
      })
      return await Promise.all(rs.map(p2pMessageToBaseMessage))
    }

    default:
      throw new Error('[getMessaeges] Invalid type')
  }
}

export async function getListMessage(conversation: BaseConversation, options?: PageLimit) {
  try {
    const raw = await getMessaeges(conversation, options)

    const messages = await fulfilledPromises(
      raw.map(async (item) => {
        const fullMessage = await baseMessageToMessage(item, conversation)

        setMessageInfo(fullMessage.id, fullMessage)
        return fullMessage
      })
    )
    await new Promise((rs) => setTimeout(rs, 100))
    return messages.map((item) => item.id)
  } catch (error) {
    console.error('list mesage error', error)
    throw error
  }
}

export const createMessgesQuery = (base?: BaseConversation) =>
  infiniteQueryOptions({
    queryKey: MESSAGE_QUERY_KEY.list(base!.id),
    enabled: !!base && !!base.id && !!base.type,
    initialPageParam: 1,
    staleTime: Infinity,
    getNextPageParam: (lastPage: string[], _allPages, lastPageParam) => {
      if (lastPage.length === 0) return undefined
      return (lastPageParam ?? 1) + 1
    },
    getPreviousPageParam: () => undefined, // không hỗ trợ load newer ở đây (dùng refetch riêng)
    queryFn: async ({ pageParam = 1 }) => {
      const rs = await getListMessage(base!, { page: pageParam })
      return rs
    }
  })

export function useMessaeges() {
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  const { base } = useCurrentState()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery(createMessgesQuery(base))

  React.useEffect(() => {
    if (!loadMoreRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // preload sớm một chút
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return

    fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const ids = [...new Set(data?.pages.flat() ?? [])]

  return { ids, isLoading, isError, loadMoreRef, isFetchingNextPage, hasNextPage }
}

export function removeIdInMessgeList(id: string, converstaionId: string) {
  queryClient.setQueryData(
    MESSAGE_QUERY_KEY.list(converstaionId),
    (old: InfiniteData<string[]>) => {
      if (!old) return old

      return {
        pageParams: old.pageParams,
        pages: old.pages.map((page) => page.filter((i) => i !== id))
      }
    }
  )
}

export async function addIdInMessageList(id: string, conversation: BaseConversation) {
  const key = MESSAGE_QUERY_KEY.list(conversation.id)

  // đảm bảo page 1 đã tồn tại trong cache (không double fetch)
  await queryClient.ensureInfiniteQueryData({
    queryKey: key,
    initialPageParam: 0
  })

  queryClient.setQueryData<InfiniteData<string[]>>(key, (old) => {
    if (!old) return old

    return {
      ...old,
      pages: old.pages.map((page, idx) => (idx === 0 ? [id, ...page] : page))
    }
  })
}

export function replaceIdInMessageList(
  oldId: string,
  newId: string,
  conversation: BaseConversation
) {
  queryClient.setQueryData<InfiniteData<string[]>>(
    MESSAGE_QUERY_KEY.list(conversation.id),
    (old) => {
      if (!old) return old

      return {
        pageParams: old.pageParams,
        pages: old.pages.map((page) => page.map((id) => (id === oldId ? newId : id)))
      }
    }
  )
}
