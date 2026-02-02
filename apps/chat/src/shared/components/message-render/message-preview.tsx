'use client'
import * as React from 'react'
import type { Message } from '@/modules/message'
import { FileIcon, ImageIcon, MapPinIcon, MicIcon } from 'lucide-react'
import { useI18N } from '@/shared/hooks'

type Props = {
  message: Message
  className?: string
}

function MessagePreview({ message, className }: Props) {
  const { t } = useI18N()

  switch (message.type) {
    case 'text':
      return <span className={className}>{message.content}</span>

    case 'sticker':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <ImageIcon size={14} />
          {t('message.type.sticker', { defaultValue: '[Sticker]' })}
        </span>
      )

    case 'file':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <FileIcon size={14} />
          {message.fileName || t('message.type.file', { defaultValue: '[File]' })}
        </span>
      )

    case 'voice':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <MicIcon size={14} />
          {t('message.type.voice', { defaultValue: '[Voice Memo]' })}
        </span>
      )

    case 'location':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <MapPinIcon size={14} />
          {message.address || t('message.type.location', { defaultValue: '[Location]' })}
        </span>
      )

    default:
      return null
  }
}

export default React.memo(MessagePreview)
