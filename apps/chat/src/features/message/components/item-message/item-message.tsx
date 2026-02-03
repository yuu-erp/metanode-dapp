'use client'
import type { Message } from '@/modules/message'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { useLongPress } from '@/shared/hooks'
import { cn } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { motion } from 'framer-motion'
import * as React from 'react'
import {
  ForwardMessage,
  ItemMessageView,
  MessageStatus,
  ReactionMessage,
  ReplyMessage,
  type MessageItemProps
} from '.'

function ItemMessage({
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

  const isSticker = React.useMemo(() => message.type === 'sticker', [message.type])

  return (
    <motion.div
      layoutId={layoutId}
      className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'} px-2`}
      {...handlers}
      {...props}
    >
      <div
        className={cn(
          'max-w-[90%] min-w-[100px] rounded-2xl px-3 pt-2 pb-1 relative',
          'transition-all duration-300 ease-out',
          isLongPressActive && 'scale-90',
          isMine
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-gray-200 text-gray-900 rounded-bl-xs',
          isFailed && 'bg-red-50 text-red-700 border border-red-300',
          isSticker && 'bg-transparent border-none'
        )}
      >
        <ReplyMessage replyTo={message.replyTo} isMine={isMine} />
        <ForwardMessage forwardFrom={message.forwardFrom} isMine={isMine} />
        <ItemMessageView message={message} />
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
            {message.isEdited && <span>edited</span>}
            <span>{formatMessageTime(message.timestamp)}</span>
            {isMine && <MessageStatus status={message.status} />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default React.memo(ItemMessage)
