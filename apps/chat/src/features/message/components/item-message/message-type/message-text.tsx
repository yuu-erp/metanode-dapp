'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import SharedMessageText from '@/shared/components/message-render/message-text'

type Props = {
  message: Extract<Message, { type: 'text' }>
}

function MessageText({ message }: Props) {
  return <SharedMessageText message={message} />
}

export default React.memo(MessageText)
