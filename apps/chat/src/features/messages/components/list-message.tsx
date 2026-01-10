'use client'

import * as React from 'react'
import { useRef, useEffect } from 'react'
import { useInfiniteMessages } from '../hooks'
import MessageItem from './message-item'
import { useCurrentAccount } from '@/shared/hooks'
import type { Conversation } from '@/modules/conversation'
import { LoaderCircle } from 'lucide-react'

interface ListMessageProps {
  conversation?: Conversation
}

function ListMessage({ conversation }: ListMessageProps) {
  const { data: currentAccount } = useCurrentAccount()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteMessages({
      account: currentAccount,
      conversation,
      pageSize: 30
    })

  // Ref để gắn vào phần tử trigger load more (khi scroll lên trên)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver để detect khi người dùng scroll gần đầu danh sách
  useEffect(() => {
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

  // Flatten tất cả pages thành một mảng tin nhắn duy nhất
  // Tin nhắn mới nhất ở dưới (cuối mảng)
  const messages = data?.pages.flat() ?? []

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Lỗi khi tải tin nhắn</p>
      </div>
    )
  }

  if (!currentAccount || !conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-white/60 font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    )
  }

  return (
    <div
      className="flex h-full flex-col-reverse overflow-y-auto"
      style={{ paddingBottom: 'var(--header-height)' }}
    >
      {/* Danh sách tin nhắn - hiển thị từ cũ → mới (do flex-col-reverse) */}
      {messages.map((message, idx) => (
        <MessageItem key={message.id} message={message} isMine={idx % 2 === 0} />
      ))}
      {/* Trigger load more khi scroll lên đầu */}
      <div
        ref={loadMoreRef}
        className="py-4 text-center"
        style={{
          paddingTop: 'calc(var(--header-height) + 30px)'
        }}
      >
        {isFetchingNextPage && (
          <div className="w-full flex items-center justify-center">
            <LoaderCircle className="size-8 animate-spin" />
          </div>
        )}
        {!hasNextPage && messages.length > 0 && (
          <p className="text-sm text-white/60 font-medium">Đã tải hết tin nhắn</p>
        )}
      </div>

      {/* Nếu chưa có tin nhắn nào */}
      {messages.length === 0 && !isFetchingNextPage && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-white/60 font-medium">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </p>
        </div>
      )}
    </div>
  )
}

export default React.memo(ListMessage)
