'use client'
import * as React from 'react'
import type { ReplyReference } from '@/modules/message'
import { TextContentWithMentions } from '@/shared/components/message-render'
import { cn } from '@/shared/lib'

type Props = {
  message: ReplyReference<'text'>
  isMine?: boolean
}

function ReplyMessageText({ message, isMine }: Props) {
  return (
    <div
      className={cn(
        'text-xs font-medium line-clamp-1 break-all',
        isMine ? 'text-white' : 'text-gray-800'
      )}
    >
      <TextContentWithMentions text={message.content} />
    </div>
  )
}

export default React.memo(ReplyMessageText)
