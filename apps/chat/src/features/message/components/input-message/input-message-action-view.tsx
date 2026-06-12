'use client'

import type { MessageAction } from '@/modules/message'
import { X } from 'lucide-react'
import * as React from 'react'

interface InputMessageActionViewProps {
  title?: string
  onClose?: () => void
  messageAction: MessageAction
}
function InputMessageActionView({
  title = '',
  onClose,
  messageAction
}: InputMessageActionViewProps) {
  console.log({ messageAction })
  return (
    <div className="h-12 flex items-center gap-2 text-white px-2">
      <span className="h-full w-[3px] rounded-md bg-blue-500" />

      <div className="h-full flex-1 flex items-center gap-2">
        <div className="flex-1 overflow-hidden">
          <div className="text-base font-medium line-clamp-1 text-blue-400">{title}</div>

          <div className="text-xs font-medium text-blue-100 line-clamp-1 break-all">
            {/* <MessagePreview message={messageAction.message} /> */}
          </div>
        </div>

        <X className="shrink-0 size-5 cursor-pointer" onClick={onClose} />
      </div>
    </div>
  )
}

export default React.memo(InputMessageActionView)
