'use client'
import * as React from 'react'
import type { ReplyReference } from '@/modules/message'

type Props = {
  message: ReplyReference<'sticker'>
}

function ReplyMessageSticker({ message }: Props) {
  return (
    <div className="text-base truncate mt-0.5">
      <img
        src={`/stickers/${message.stickerId}.png`}
        alt="sticker"
        className="size-6 pointer-events-none"
        draggable={false}
      />
    </div>
  )
}

export default React.memo(ReplyMessageSticker)
