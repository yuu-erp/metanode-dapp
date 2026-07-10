'use client'
import type { Account } from '@/modules/account'
import type { Message } from '@/modules/message'
import { LoaderCircle } from 'lucide-react'
import * as React from 'react'
import MessageItem from '../item-message/item-message'
import { formatAddress } from '@/shared/utils'

interface ListMessageViewProps {
  messages: Message[]
  isLoading?: boolean
  isError?: boolean
  loadMoreRef?: React.RefObject<HTMLDivElement | null>
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  account?: Account
  handleSelectMessage?: (message: Message) => void
}
function ListMessageView({
  messages,
  isLoading,
  isError,
  loadMoreRef,
  isFetchingNextPage,
  hasNextPage,
  account,
  handleSelectMessage
}: ListMessageViewProps) {
  console.log('[ListMessageView] ', { messages })

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
  console.log('messages', messages)
  return (
    <React.Fragment>
      {/* Danh sách tin nhắn - hiển thị từ cũ → mới (do flex-col-reverse) */}
      {messages.map((message) => {
        return (
          <MessageItem
            key={message.id ?? message.clientId}
            message={message}
            isMine={
              message?.isMine ??
              formatAddress(message.sender) === formatAddress(account?.contractAddress || '')
            }
            onSelectMessage={handleSelectMessage}
            layoutId={`message-${message.id ?? message.clientId}`}
          />
        )
      })}
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
          <p className="text-sm text-black font-medium">Đã tải hết tin nhắn</p>
        )}
      </div>

      {/* Nếu chưa có tin nhắn nào */}
      {messages.length === 0 && !isFetchingNextPage && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm  font-medium">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      )}
    </React.Fragment>
  )
}

export default React.memo(ListMessageView)
