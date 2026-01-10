'use client'

import type { Message } from '@/modules/message'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { Check, CheckCheck, AlertTriangle, Clock } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/lib'

interface MessageItemProps {
  message: Message
  isMine?: boolean
}

function MessageItem({ message, isMine }: MessageItemProps) {
  const isFailed = isMine && message.status === 'failed'

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return <p className="whitespace-pre-wrap break-words font-normal">{message.content}</p>
      default:
        return <p className="text-sm opacity-70">[Tin nhắn không hỗ trợ]</p>
    }
  }

  const renderStatusIcon = () => {
    if (!isMine) return null

    switch (message.status) {
      case 'sent':
        return <Check className="size-3.5 text-white" />

      case 'delivered':
        return <CheckCheck className="size-3.5 text-white" />

      case 'read':
        return <CheckCheck className="size-3.5 text-green-500" />

      case 'failed':
        return <AlertTriangle className="size-4 text-red-500" />

      default:
        return <Clock className="size-3.5 text-white opacity-70" />
    }
  }

  return (
    <div className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={cn(
          'max-w-[90%] min-w-[100px] rounded-2xl px-4 pt-2 pb-6 relative',
          isMine
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none',
          isFailed && 'bg-red-50 text-red-700 border border-red-300'
        )}
      >
        <div className="text-base">{renderContent()}</div>

        {/* Failed label */}
        <div
          className={cn(
            'text-[11px] flex items-center gap-1 absolute bottom-1 right-3',
            isMine ? 'text-blue-200' : 'text-gray-500',
            isFailed && 'text-red-500'
          )}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageItem)
