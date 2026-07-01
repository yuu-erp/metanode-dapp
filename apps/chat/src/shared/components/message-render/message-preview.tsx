'use client'
import { STICKERS } from '@/constants/stickers'
import type { Message } from '@/modules/message'
import { useI18N } from '@/shared/hooks'
import { useMetadata } from 'file-core'
import { FileIcon, MapPinIcon, MicIcon } from 'lucide-react'
import * as React from 'react'
import { TextContentWithMentions } from './message-text'

type Props = {
  message: Message
  className?: string
}

const FilePreview = ({ id }: { id: string }) => {
  const { t } = useI18N()
  const { metadata } = useMetadata(id)
  console.log('metadata', metadata)
  return (
    <span className="flex items-center gap-1 opacity-70 italic">
      <FileIcon size={14} />
      {metadata?.name || t('message.type.file', { defaultValue: '[File]' })}
    </span>
  )
}

function MessagePreview({ message, className }: Props) {
  const { t } = useI18N()
  const path = STICKERS.flatMap((i) => i.stickers).find(
    (i) => message.type === 'sticker' && i.id === message.stickerId
  )?.image
  console.log('MessagePreview', { message })

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
      const fileId = message?.fileIds?.[0]
      if (!fileId) return null
      return <FilePreview id={fileId} />

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
