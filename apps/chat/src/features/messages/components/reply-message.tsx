'use client'
import { cn } from '@/shared/lib'
import * as React from 'react'
import { useReplyMeta } from '../hooks'

interface ReplyMessageProps {
  sender: string
  type: 'text' | 'sticker'
  textPreview?: string
  stickerPreview?: string
  isMine?: boolean
}
function ReplyMessage({ sender, type, textPreview, isMine }: ReplyMessageProps) {
  const { title, content } = useReplyMeta(sender, type, textPreview)

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
          <div className="text-sm font-medium line-clamp-1 text-blue-400">Reply to {title}</div>

          <div
            className={cn(
              'text-xs font-medium line-clamp-1 break-all',
              isMine ? 'text-blue-100' : 'text-black'
            )}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ReplyMessage)
