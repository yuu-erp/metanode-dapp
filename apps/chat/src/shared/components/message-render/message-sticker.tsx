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

function MessageSticker({ message: _message, className }: Props) {
  return (
    <div className={cn('relative overflow-hidden group', className)}>
      <img
        src={`/stickers/${_message.stickerId}.png`}
        alt="sticker"
        className="size-6 object-contain transition-transform duration-200 group-hover:scale-110"
        draggable={false}
      />
    </div>
  )
}

export default React.memo(MessageSticker)
