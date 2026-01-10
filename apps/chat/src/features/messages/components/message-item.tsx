'use client'

import type { Message } from '@/modules/message'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { CheckCheck } from 'lucide-react'
import * as React from 'react'

interface MessageItemProps {
  message: Message
  isMine?: boolean
}

function MessageItem({ message, isMine }: MessageItemProps) {
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
        className={`max-w-[90%] min-w-[100px] rounded-2xl px-4 pt-2 pb-4 relative ${
          isMine
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        {/* Hiển thị tên người gửi nếu là nhóm (tùy chọn) */}
        {/* {!isMine && <p className="text-xs opacity-70 mb-1">{message.senderName || truncateAddress(message.sender)}</p>} */}

        <div className="text-base">{renderContent()}</div>

        <div
          className={`text-[11px] flex items-center absolute bottom-1 right-3 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {isMine && (
            <span className="ml-1">
              {message.status === 'sent' && <CheckCheck className="text-white size-3.5" />}
              {message.status === 'delivered' && <CheckCheck className="text-white size-3.5" />}
              {message.status === 'read' && <CheckCheck className="text-green-500 size-3.5" />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageItem)
