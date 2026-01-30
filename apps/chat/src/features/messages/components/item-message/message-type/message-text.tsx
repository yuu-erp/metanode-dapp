'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'

type Props = {
  message: Extract<Message, { type: 'text' }>
}

function MessageText({ message }: Props) {
  return <div className="text-base break-all">{message.content}</div>
}

export default React.memo(MessageText)
