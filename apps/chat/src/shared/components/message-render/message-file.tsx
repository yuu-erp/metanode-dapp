'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { FileIcon, DownloadIcon } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

type Props = {
  message: Extract<Message, { type: 'file' }>
  className?: string
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function MessageFile({ message, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer min-w-[240px] max-w-full',
        className
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
        <FileIcon size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-white" title={message.fileName}>
          {message.fileName}
        </div>
        <div className="text-xs text-white/50">{formatFileSize(message.size)}</div>
      </div>

      <div className="flex-shrink-0 text-white/40 hover:text-white transition-colors">
        <DownloadIcon size={20} />
      </div>
    </div>
  )
}

export default React.memo(MessageFile)
