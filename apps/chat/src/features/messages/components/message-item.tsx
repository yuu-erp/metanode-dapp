'use client'

import * as React from 'react'
import type { Message } from '@/modules/message'

interface MessageItemProps {
  message: Message
  currentAccountId?: string // address của người dùng hiện tại
}

function MessageItem({ message, currentAccountId }: MessageItemProps) {
  const isMine = message.sender === currentAccountId

  // Xử lý các loại tin nhắn khác nhau
  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>
      default:
        return <p className="text-sm opacity-70">[Tin nhắn không hỗ trợ]</p>
    }
  }

  return (
    <div className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isMine
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        {/* Hiển thị tên người gửi nếu là nhóm (tùy chọn) */}
        {/* {!isMine && <p className="text-xs opacity-70 mb-1">{message.senderName || truncateAddress(message.sender)}</p>} */}

        <div className="text-base">{renderContent()}</div>

        <div className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
          <span>{message.timestamp}</span>
          {isMine && (
            <span className="ml-2">
              {message.status === 'read' && '✓✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'sent' && '✓'}
              {message.status === 'failed' && '!'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageItem)
