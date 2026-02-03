'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { File } from 'lucide-react'

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

  const isImage = message.mimeType.startsWith('image/')

  if (isImage && message.filePath) {
    return (
      <div className="relative rounded-xl overflow-hidden max-w-sm group">
        <img
          src={message.filePath}
          alt={message.fileName}
          className="w-full h-auto max-h-[360px] object-contain pointer-events-none"
          draggable={false}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-white truncate">{message.fileName}</div>
          <div className="text-[10px] text-white/80">{formattedSize}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 flex items-center justify-center bg-blue-500 rounded-full text-blue-200">
        <File className="size-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{message.fileName}</div>
        <div className="flex items-center gap-2">
          <div className="text-xs">{formattedSize}</div>
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
