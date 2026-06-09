'use client'
import { STICKERS } from '@/constants/stickers'
import type { Message } from '@/modules/message'
import { useI18N } from '@/shared/hooks'
import { FileIcon, MapPinIcon, MicIcon } from 'lucide-react'
import * as React from 'react'
import { TextContentWithMentions } from './message-text'

type Props = {
  message: Message
  className?: string
}

function MessagePreview({ message, className }: Props) {
  const { t } = useI18N()
  const path = STICKERS.flatMap((i) => i.stickers).find(
    (i) => message.type === 'sticker' && i.id === message.stickerId
  )?.image

  switch (message.type) {
    case 'text':
      return (
        <span className={className}>
          <TextContentWithMentions text={message.content} />
        </span>
      )

    case 'sticker':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <img src={path} alt="" className="size-6 rounded-sm" />
          {t('message.type.sticker', { defaultValue: '[Sticker]' })}
        </span>
      )

    case 'file':
      if (message.mimeType?.startsWith('image/') && message.file) {
        const file = message.file
        if (!(file instanceof File)) return null

        return (
          <span className="flex items-center gap-1 opacity-70 italic">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="size-6 object-cover rounded-sm"
            />
            {/* Hiện thị file name */}
            {message.fileName || t('message.type.file', { defaultValue: '[File]' })}
          </span>
        )
      }
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
