'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { STICKERS } from '@/constants/stickers'

type Props = {
  message: Extract<Message, { type: 'sticker' }>
}

function MessageSticker({ message }: Props) {
  // STICKER
  const path = STICKERS.flatMap((i) => i.stickers).find((i) => i.id === message.stickerId)

  return (
    <div className="w-full h-auto flex justify-end">
      <img
        src={path?.image}
        alt="sticker"
        className="w-24 h-24 pointer-events-none mb-1"
        draggable={false}
      />
    </div>
  )
}

export default React.memo(MessageSticker)
