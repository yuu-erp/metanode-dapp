'use client'
import * as React from 'react'
import type { ReplyReference } from '@/modules/message'

type Props = {
  message: ReplyReference<'sticker'>
}

function ReplyMessageSticker({ message }: Props) {
  return <div className="text-base truncate">{message.stickerId}</div>
}

export default React.memo(ReplyMessageSticker)
