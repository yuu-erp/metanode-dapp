'use client'

import { X } from 'lucide-react'
import * as React from 'react'
import { type MessageAction } from '../../contexts'
import { useReplyMeta } from '../../hooks'

interface ReplyInputMessageProps {
  messageAction: MessageAction
  onClose?: () => void
}
function ReplyInputMessage({ messageAction, onClose }: ReplyInputMessageProps) {
  if (!messageAction) return null

  const { title, content } = useReplyMeta(
    messageAction.message.sender,
    messageAction.message.type,
    messageAction.message.type === 'text' ? messageAction.message.content : undefined
  )

  return (
    <div className="h-14 flex items-center gap-2 text-white px-2 py-1">
      <span className="h-full w-[3px] rounded-md bg-blue-500" />

      <div className="h-full flex-1 flex items-center gap-2">
        <div className="flex-1 overflow-hidden">
          <div className="text-base font-medium line-clamp-1 text-blue-500">Reply to {title}</div>

          <div className="text-xs font-medium text-blue-100 line-clamp-1 break-all">{content}</div>
        </div>

        <X className="shrink-0 size-5 cursor-pointer" onClick={onClose} />
      </div>
    </div>
  )
}

export default React.memo(ReplyInputMessage)
