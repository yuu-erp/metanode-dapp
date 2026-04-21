'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import MessageText from './message-text'
import MessageSticker from './message-sticker'
import MessageFile from './message-file'
import MessageVoice from './message-voice'
import MessageLocation from './message-location'

type Props = {
  message: Message
  className?: string
}

function MessageRender({ message, className }: Props) {
  switch (message.type) {
    case 'text':
      return <MessageText message={message} className={className} />
    case 'sticker':
      return <MessageSticker message={message} className={className} />
    case 'file':
      return <MessageFile message={message} className={className} />
    case 'voice':
      return <MessageVoice message={message} className={className} />
    case 'location':
      return <MessageLocation message={message} className={className} />
    default:
      // Fallback for unknown message types
      return (
        <div className="text-sm italic text-white/40 p-2 border border-dashed border-white/10 rounded-lg">
          Unsupported message type: {(message as any).type}
        </div>
      )
  }
}

export default React.memo(MessageRender)
