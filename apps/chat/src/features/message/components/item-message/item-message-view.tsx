'use client'
import type { Message } from '@/modules/message'
import { MessageFile, MessageSticker, MessageText } from './message-type'
import { VoiceItem } from './variants/voice-item'

interface ItemMessageViewProps {
  message: Message
  isMine?: boolean
  isOverlay?: boolean
}
export default function ItemMessageView({ message, isMine, isOverlay }: ItemMessageViewProps) {
  switch (message.type) {
    case 'text':
      return <MessageText message={message} />

    case 'sticker':
      return <MessageSticker message={message} />

    case 'file':
      return <MessageFile message={message} isMine={isMine} isOverlay={isOverlay} />

    case 'voice':
      return <VoiceItem message={message} />

    case 'location':
      return <div>📍 {message.address ?? `${message.latitude}, ${message.longitude}`}</div>

    default:
      return null
  }
}
