'use client'
import type { Message } from '@/modules/message'
import { formatMessageTime } from '@/shared/helpers/date-fns'
import { useCurrentConversationType } from '@/shared/hooks'
import { cn } from '@/shared/lib'
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
import { GroupMemberName } from './group/group-member-name'
import { GroupMemberAvatar } from './group/group-member-avatar'

export interface ItemMessageUIProps extends MessageItemProps<Message> {
  handlers: any
  isLongPressActive: boolean
  isImage?: boolean
  isVideo?: boolean
  isSticker?: boolean
  isFailed?: boolean
}

function ItemMessageUI({
  message,
  isMine,
  layoutId,
  handlers,
  isLongPressActive,
  isImage,
  isVideo,
  isSticker,
  isFailed,
  ...props
}: ItemMessageUIProps) {
  const type = useCurrentConversationType()

  const isInGroup = !isMine && (type === 'group' || type === 'anonymous_group')
  return (
    <motion.div
      message-id={message.id}
      layoutId={layoutId}
      className={`flex gap-2 mb-4 ${isMine ? 'justify-end' : 'justify-start'} px-2`}
      {...handlers}
      {...props}
    >
      {isInGroup && <GroupMemberAvatar sender={message.sender} />}
      <div
        className={cn(
          'max-w-[70%] min-w-[100px] rounded-2xl px-3 pt-2 pb-1 relative',
          'transition-all duration-300 ease-out',
          isLongPressActive && 'scale-90',
          isMine
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-gray-200 text-gray-900 rounded-bl-xs',
          isFailed && 'bg-red-50 text-red-700 border border-red-300',
          (isSticker || isImage || isVideo) && 'bg-transparent border-none px-0 py-0'
        )}
      >
        <ReplyMessage replyTo={message.replyTo} isMine={isMine} />
        <ForwardMessage forwardFrom={message.forwardFrom} isMine={isMine} />
        {isInGroup && !isMine && <GroupMemberName sender={message.sender} />}
        <ItemMessageView message={message} isMine={isMine} />

        <div
          className={cn(
            'w-full flex items-end justify-between gap-3',
            (isImage || isVideo) && 'absolute bottom-1.5 right-1.5'
          )}
        >
          <div className="flex items-center gap-1">
            <ReactionMessage reactions={message?.reactions} />
          </div>
          <div
            className={cn(
              'text-[11px] flex items-center gap-1',
              isMine ? 'text-blue-200' : 'text-gray-500',
              isFailed && 'text-red-500',
              (isImage || isVideo) &&
                'bg-black/40 backdrop-blur-sm p-0.5 pl-1 rounded-full text-white'
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

export default React.memo(ItemMessageUI)
