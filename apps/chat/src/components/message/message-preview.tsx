import { useCurrentMessageById } from '@/new/message'
import { FileIcon, MapPinIcon, MicIcon } from 'lucide-react'
import { memo } from 'react'
import { TextContentWithMentions } from './content-variants'
import { useFileCache, useMetadata } from 'file-core'

export type MessagePreviewProps = {
  id?: string
}

export const MessagePreview = memo(({ id }: MessagePreviewProps) => {
  const { data: message } = useCurrentMessageById(id)
  if (!message) return null
  switch (message.type) {
    case 'text':
      return (
        <span className={''}>
          <TextContentWithMentions text={message.content ?? ''} />
        </span>
      )

    case 'sticker':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          {/* <img src={path} alt="" className="size-6 rounded-sm" /> */}
          {/* {t('message.type.sticker', { defaultValue: '[Sticker]' })} */}
        </span>
      )

    case 'file': {
      const id = message.fileIds?.[0]
      const { metadata } = useMetadata(id)
      const { cache } = useFileCache(id)

      if (''.startsWith('image/')) {
        return (
          <span className="flex items-center gap-1 opacity-70 italic">
            <img
              src={cache?.previewPath}
              alt="preview"
              className="size-6 object-cover rounded-sm"
            />
            {/* Hiện thị file name */}[{metadata?.name}]
            {/* {message.fileName || t('message.type.file', { defaultValue: '[File]' })} */}
          </span>
        )
      }
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <FileIcon size={14} />[{metadata?.name}]
          {/* {message.fileName || t('message.type.file', { defaultValue: '[File]' })} */}
        </span>
      )
    }

    case 'voice':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <MicIcon size={14} />
          [Voice Memo]
        </span>
      )

    case 'location':
      return (
        <span className="flex items-center gap-1 opacity-70 italic">
          <MapPinIcon size={14} />
          {/* {message.address || t('message.type.location', { defaultValue: '[Location]' })} */}
        </span>
      )

    default:
      return null
  }
})
