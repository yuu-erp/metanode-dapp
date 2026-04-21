'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

type Props = {
  message: Extract<Message, { type: 'text' }>
  className?: string
}

function MessageText({ message, className }: Props) {
  // Simple regex for URL detection
  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {part}
          </a>
        )
      }
      return <React.Fragment key={i}>{part}</React.Fragment>
    })
  }

  return (
    <div
      className={cn('text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap', className)}
    >
      {renderContent(message.content)}
    </div>
  )
}

export default React.memo(MessageText)
