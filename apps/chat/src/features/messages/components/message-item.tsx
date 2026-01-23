'use client'

import type { Message } from '@/modules/message'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { useLongPress } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { AlertTriangle, Check, CheckCheck, Clock } from 'lucide-react'
import * as React from 'react'
import ReactionMessage from './reaction-message'
import ReplyMessage from './reply-message'

interface MessageItemProps<T> extends Omit<HTMLMotionProps<'div'>, 'children'> {
  message: T
  isMine?: boolean
  onSelectMessage?: (message: T) => void
  layoutId?: string
}

function MessageItem({
  message,
  isMine,
  onSelectMessage,
  layoutId,
  ...props
}: MessageItemProps<Message>) {
  const { handlers, isLongPressActive } = useLongPress({
    threshold: 250,
    shouldPreventDefault: true,
    movementThreshold: 12,
    onLongPressStart: () => {
      console.log('Long press start')
    },
    onLongPressEnd: () => {
      onSelectMessage?.(message)
      sendCommand('vibrate')
    }
  })

  const isFailed = React.useMemo(
    () => isMine && message.status === 'failed',
    [isMine, message.status]
  )

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
    <motion.div
      layoutId={layoutId}
      {...handlers}
      className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'} px-2`}
      {...props}
    >
      <div
        className={cn(
          'max-w-[90%] min-w-[100px] rounded-2xl px-3 pt-2 pb-1 relative',
          'transition-all duration-300 ease-out',
          isLongPressActive && 'scale-90',
          isMine
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none',
          isFailed && 'bg-red-50 text-red-700 border border-red-300'
        )}
      >
        {message.replyTo && <ReplyMessage isMine={isMine} {...message.replyTo} />}
        {/* {message.forwardFrom && <ForwardMessage isMine={isMine} {...message.forwardFrom} />} */}
        <div className="text-base">{renderContent()}</div>
        {/* Failed label */}
        <div className="w-full flex items-end justify-between gap-3">
          <div className="flex items-center gap-1">
            <ReactionMessage reactions={message?.reactions} />
          </div>
          <div
            className={cn(
              'text-[11px] flex items-end gap-1',
              isMine ? 'text-blue-200' : 'text-gray-500',
              isFailed && 'text-red-500'
            )}
          >
            <span>{formatMessageTime(message.timestamp)}</span>
            {renderStatusIcon()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(MessageItem)
