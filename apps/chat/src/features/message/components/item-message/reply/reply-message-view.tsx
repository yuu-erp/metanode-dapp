'use client'
import type { ReplyReference } from '@/modules/message'
import { cn } from '@/shared/lib'
import * as React from 'react'
import ReplyMessageSticker from './reply-message-sticker'
import ReplyMessageText from './reply-message-text'

interface ReplyMessageViewProps {
  replyTo: ReplyReference
  replyToUser?: string
  isMine?: boolean
}

function ReplyMessageView({ replyTo, replyToUser = 'Người dùng', isMine }: ReplyMessageViewProps) {
  const replyPreview = React.useMemo(() => {
    switch (replyTo.type) {
      case 'text':
        return <ReplyMessageText message={replyTo as ReplyReference<'text'>} isMine={isMine} />

      case 'sticker':
        return <ReplyMessageSticker message={replyTo as ReplyReference<'sticker'>} />

      default:
        return null
    }
  }, [replyTo])
  return (
    <div
      className={cn(
        'h-12 flex items-center gap-2 text-white rounded-md relative mb-1',
        isMine ? 'bg-blue-700' : 'bg-blue-100'
      )}
    >
      <span className="h-full w-[3px] rounded-l-md bg-blue-500 absolute left-0" />

      <div className="h-full flex-1 flex items-center gap-2 px-3">
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-semibold line-clamp-1 text-blue-400">
            Reply to {replyToUser}
          </div>
          {replyPreview}
        </div>
      </div>
    </div>
  )
}

export default React.memo(ReplyMessageView)
