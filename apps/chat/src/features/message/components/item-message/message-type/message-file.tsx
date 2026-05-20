import { useDownloadFile } from '@/features/message/hooks/use-download-file'
import type { Message } from '@/modules/message'
import { useEventBus } from '@/shared/hooks/use-eventbus'
import { cn } from '@/shared/lib'
import { Download, File, Loader2 } from 'lucide-react'
import * as React from 'react'

type Props = {
  message: Extract<Message, { type: 'file' }>
  isMine?: boolean
  isOverlay?: boolean
}

function MessageFile({ message, isMine, isOverlay }: Props) {
  const { isDownloading, progress, downloadFile, downloadedFileId } = useDownloadFile()

  const isDownloadingThis = isDownloading && downloadedFileId === (message.fileId || message.id)
  const handleDownload = React.useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (message.filePath) {
        window.open(message.filePath, '_blank')

        // if (window.finSdk) {
        //   window.open(message.filePath, '_blank')
        // } else {
        //   alert('helper not found')
        // }
        return
      }

      // If no fileId (e.g. optimistic), try to use ID but it might fail if not on chain yet
      const fileId = message.fileId || message.id
      if (!fileId) return

      await downloadFile(fileId, fileId, message.fileName, message.mimeType)
    },
    [message, downloadFile]
  )

  const formattedSize = React.useMemo(() => {
    const size = message.size
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }, [message.size])

  const isImage = message.mimeType.startsWith('image/')
  const isVideo = message.mimeType.startsWith('video/')

  const mediaSrc = React.useMemo(() => {
    if (!message.filePath) return ''
    const raw = message.filePath
    if (raw.startsWith('image://img.m.pro')) return raw

    if (raw.startsWith('http') || raw.startsWith('blob:')) return raw
    // Check if it already has data URI prefix
    if (raw.startsWith('data:')) return raw
    // Otherwise assume base64 and prepend prefix
    return `data:${message.mimeType};base64,${raw}`
  }, [message.filePath, message.mimeType])

  useEventBus('file.download', async (e) => {
    if (isOverlay) return
    if (e.messageId !== message.id) {
      return
    } else {
    }
    const fileId = message.fileId || message.id
    if (!fileId) return
    console.log('[download]', { message })
    await downloadFile(fileId, fileId, message.fileName, message.mimeType)
  })

  if ((isImage || isVideo) && mediaSrc) {
    return (
      <div className="relative rounded-2xl overflow-hidden max-w-sm group">
        {isImage ? (
          <img
            src={mediaSrc}
            alt={message.fileName}
            className="w-full h-auto max-h-[360px] object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <video src={mediaSrc} controls className="w-full h-auto max-h-[360px] object-contain" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="text-xs text-white truncate">{message.fileName}</div>
          <div className="text-[10px] text-white/80">{formattedSize}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={handleDownload}>
      <div
        className={cn(
          'w-12 h-12 flex items-center justify-center rounded-full shrink-0 relative',
          isMine ? 'bg-blue-500 text-blue-200' : 'bg-blue-200 text-[#3b82f6]'
        )}
      >
        {isDownloadingThis ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10px] font-bold">{progress}%</div>
            <Loader2 className="size-6 animate-spin absolute opacity-20" />
          </div>
        ) : (
          <>{message.filePath ? <File className="size-6" /> : <Download className="size-6" />}</>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{message.fileName}</div>
        <div className="flex items-center gap-2">
          <div className="text-xs">{formattedSize}</div>
          {message.filePath && (
            <div className="px-1.5 py-0.5 rounded bg-green-500/10 text-[10px] text-green-400 font-medium">
              Local
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MessageFile)
