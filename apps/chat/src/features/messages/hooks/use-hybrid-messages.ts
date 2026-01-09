'use client'

import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message } from '@/modules/message'
import { useEffect, useMemo, useRef } from 'react'
import { useGetMessages, useInfiniteMessages } from '.'

interface UseHybridMessagesParams {
  account?: Account
  conversation?: Conversation
  pageSize?: number
}

export function useHybridMessages({
  account,
  conversation,
  pageSize = 30
}: UseHybridMessagesParams) {
  /* ----------------------------------
   * 1. Local messages (IndexedDB)
   * ---------------------------------- */
  const { data: localMessages = [], isLoading: isLocalLoading } = useGetMessages(
    account?.address,
    conversation?.conversationId
  )

  /* ----------------------------------
   * 2. Infinite messages (Server)
   * ---------------------------------- */
  const infinite = useInfiniteMessages({
    account,
    conversation,
    pageSize
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isRemoteLoading,
    isError
  } = infinite

  console.log({ data })

  /* ----------------------------------
   * 3. Network state
   * ---------------------------------- */
  const isOffline = isError && localMessages.length > 0

  /* ----------------------------------
   * 4. Sync state
   * ---------------------------------- */
  const isSyncedRef = useRef(false)

  useEffect(() => {
    if (data?.pages?.length) {
      isSyncedRef.current = true
    }
  }, [data?.pages?.length])

  const isSynced = isSyncedRef.current

  /* ----------------------------------
   * 5. Resolve messages source
   * ---------------------------------- */
  const serverMessages: Message[] = useMemo(() => data?.pages.flat() ?? [], [data])

  const messages: Message[] = useMemo(() => {
    if (serverMessages.length > 0) return serverMessages
    return localMessages
  }, [serverMessages, localMessages])

  /* ----------------------------------
   * 6. Initial loading state
   * ---------------------------------- */
  const isInitialLoading = isLocalLoading && isRemoteLoading && messages.length === 0

  return {
    messages,
    fetchNextPage,
    hasNextPage: isSynced && hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
    isOffline,
    isSynced
  }
}
