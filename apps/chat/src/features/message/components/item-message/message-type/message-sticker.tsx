'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'

type Props = {
  message: Extract<Message, { type: 'sticker' }>
}

function MessageSticker({ message }: Props) {
  return (
    <div className="w-full h-auto flex justify-end">
      <img
        src={`/stickers/${message.stickerId}.png`}
        alt="sticker"
        className="w-24 h-24 pointer-events-none mb-1"
        draggable={false}
      />
    </div>
  )
}

export default React.memo(MessageSticker)
