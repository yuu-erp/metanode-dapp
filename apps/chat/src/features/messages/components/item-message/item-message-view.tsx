'use client'
import type { Message } from '@/modules/message'
import { MessageSticker, MessageText } from './message-type'

interface ItemMessageViewProps {
  message: Message
}
export default function ItemMessageView({ message }: ItemMessageViewProps) {
  switch (message.type) {
    case 'text':
      return <MessageText message={message} />

    case 'sticker':
      return <MessageSticker message={message} />

    case 'file':
      return <div>📎 {message.fileName}</div>

    case 'voice':
      return <div>🎤 Voice {message.duration}s</div>

    case 'location':
      return <div>📍 {message.address ?? `${message.latitude}, ${message.longitude}`}</div>

    default:
      return null
  }
}
