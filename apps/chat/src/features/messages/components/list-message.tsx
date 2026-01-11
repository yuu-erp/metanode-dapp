'use client'

import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { ChevronDown, LoaderCircle } from 'lucide-react'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { useInfiniteMessages } from '../hooks'
import MessageItem from './message-item'

interface ListMessageProps {
  conversation?: Conversation
  account?: Account
}

function ListMessage({ conversation, account }: ListMessageProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteMessages({
      account: account,
      conversation,
      pageSize: 30
    })

  // Ref để gắn vào phần tử trigger load more (khi scroll lên trên)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const [showScrollBottom, setShowScrollBottom] = React.useState(false)

  const scrollToBottom = React.useCallback(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])
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

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget
    // cách bottom bao xa
    const distanceFromBottom = el.scrollTop
    setShowScrollBottom(distanceFromBottom < -200)
  }, [])
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

  if (!account || !conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-white/60 font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex h-full flex-col-reverse overflow-y-auto relative"
      style={{ paddingBottom: 'var(--header-height)' }}
    >
      {/* Danh sách tin nhắn - hiển thị từ cũ → mới (do flex-col-reverse) */}
      {messages.map((message) => (
        <MessageItem
          key={message.id ?? message.clientId}
          message={message}
          isMine={message.sender === account.contractAddress}
        />
      ))}
      {/* Button scroll to bottom */}
      {showScrollBottom && (
        <button
          className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl fixed right-2 bottom-24 z-10"
          style={{
            boxShadow: `2px 2px 6px 0px #0000004D inset`,
            bottom: 'calc(var(--chat-input-height, 96px) + 12px)'
          }}
          onClick={scrollToBottom}
        >
          <ChevronDown className="size-5" />
        </button>
      )}
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
