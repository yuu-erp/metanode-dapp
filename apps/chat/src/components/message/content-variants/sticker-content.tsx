'use client'
import { STICKERS } from '@/constants/stickers'
import type { WithMessage } from '../types'

export function StickerContent({ data }: WithMessage) {
  // STICKER
  const path = STICKERS.flatMap((i) => i.stickers).find((i) => i.id === data.stickerId)

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
