'use client'
import * as React from 'react'
import type { ReplyReference } from '@/modules/message'
import { cn } from '@/shared/lib'
import { FileIcon } from 'lucide-react'

type Props = {
  message: ReplyReference<'file'>
  isMine?: boolean
}

function ReplyMessageFile({ message, isMine }: Props) {
  return (
    <div className="flex items-center gap-1 mt-0.5">
      <FileIcon className={cn('size-4 shrink-0', isMine ? 'text-white/80' : 'text-gray-500')} />
      <div
        className={cn(
          'text-xs font-medium line-clamp-1 break-all',
          isMine ? 'text-white' : 'text-gray-800'
        )}
      >
        {message.fileName}
      </div>
    </div>
  )
}

export default React.memo(ReplyMessageFile)
