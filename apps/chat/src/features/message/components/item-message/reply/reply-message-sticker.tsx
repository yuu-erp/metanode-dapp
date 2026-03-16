'use client'
import * as React from 'react'
import type { ReplyReference } from '@/modules/message'
import { STICKERS } from '@/constants/stickers'

type Props = {
  message: ReplyReference<'sticker'>
}

function ReplyMessageSticker({ message }: Props) {
  const path = STICKERS.flatMap((i) => i.stickers).find(
    (i) => message.type === 'sticker' && i.id === message.stickerId
  )

  return (
    <div className="text-base truncate mt-0.5 items-center gap-2 flex flex-row">
      <img
        src={path?.image}
        alt="sticker"
        className="size-6 pointer-events-none"
        draggable={false}
      />
      <p>{`[Sticker]`}</p>
    </div>
  )
}

export default React.memo(ReplyMessageSticker)
