'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

type Props = {
  message: Extract<Message, { type: 'sticker' }>
  className?: string
}

function MessageSticker({ message, className }: Props) {
  return (
    <div className={cn('relative overflow-hidden group', className)}>
      <img
        // src={`/stickers/${message.stickerId}.png`}
        src="https://i.pinimg.com/736x/b3/19/7c/b3197c4a31eeaec30aaaebe2fdcf0a87.jpg"
        alt="sticker"
        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110"
        draggable={false}
      />
    </div>
  )
}

export default React.memo(MessageSticker)
