'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'

type Props = {
  message: Extract<Message, { type: 'file' }>
}

function MessageFile({ message }: Props) {
  const formattedSize = React.useMemo(() => {
    const size = message.size
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }, [message.size])

  return (
    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500/30 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-white/90">{message.fileName}</div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-white/50">{formattedSize}</div>
          {message.filePath && (
            <div className="px-1.5 py-0.5 rounded bg-green-500/10 text-[10px] text-green-400 font-medium">
              Local
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageFile)
