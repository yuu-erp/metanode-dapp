'use client'
import * as React from 'react'
import { useInfiniteMessages } from '../../hooks'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'

export function useViewInfiniteScroll({
  account,
  conversation
}: {
  account?: Account
  conversation?: Conversation
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteMessages({
      account: account,
      conversation,
      pageSize: 30
    })
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

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

  const messages = React.useMemo(() => data?.pages.flat() ?? [], [data])

  console.log('LIST MESSAGE -----', messages)

  return { messages, isLoading, isError, loadMoreRef, isFetchingNextPage, hasNextPage }
}
