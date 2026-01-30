'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'

type Props = {
  message: Extract<Message, { type: 'sticker' }>
}

function MessageSticker({ message }: Props) {
  return (
    <img
      src={`/stickers/${message.stickerId}.png`}
      alt="sticker"
      className="w-24 h-24"
      draggable={false}
    />
  )
}

export default React.memo(MessageSticker)
