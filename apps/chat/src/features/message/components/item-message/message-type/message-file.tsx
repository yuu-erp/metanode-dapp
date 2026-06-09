import { container } from '@/container'
import type { Message } from '@/modules/message'
import { cn } from '@/shared/lib'
import { useMessageStore } from '@/stores/message.store'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { Download, File, Loader2, X } from 'lucide-react'
import * as React from 'react'
import { useShallow } from 'zustand/shallow'

type Props = {
  message: Extract<Message, { type: 'file' }>
  isMine?: boolean
}

const getSizeData = (size: number) => {
  try {
    console.log('getSizeData adfsfdakkdfsl', size)
    if (size < 1024) return { v: size, unit: 'B' }

    if (size < 1024 * 1024) return { v: +(size / 1024).toFixed(1), unit: 'KB' }

    return {
      v: +(size / (1024 * 1024)).toFixed(1),
      unit: 'MB'
    }
  } catch (error) {
    return { v: 0, unit: '' }
  }
}

function MessageFile({ message, isMine }: Props) {
  console.log('messageFile message', message)
  const upProgress = useUiStore((s) => s.upFileProgress[message?.clientId || message?.id])
  const { filePath, mimeType } = useMessageStore(
    useShallow((s) => {
      const m = s.messages[message?.id ?? '']
      return {
        filePath: m?.filePath || '',
        mimeType:
          typeof message?.mimeType === 'string' && !!message?.mimeType
            ? message?.mimeType
            : m?.mimeType || ''
      }
    })
  )

  const handleDownload = React.useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation()

      if (filePath) {
        window.open(filePath, '_blank')
        return
      }
      container.eventBus.emit('file.download', {
        message
      })
      // If no fileId (e.g. optimistic), try to use ID but it might fail if not on chain yet
    },
    [message, filePath]
  )

  const sizeData = getSizeData(message?.size)
  const isImage = mimeType.startsWith('image/')
  const isVideo = mimeType.startsWith('video/')

  const mediaSrc = React.useMemo(() => {
    if (!message?.filePath) return ''
    const raw = message?.filePath
    console.log('message file', raw)
    if (raw.startsWith('image://img.m.pro')) return raw

    if (raw.startsWith('http') || raw.startsWith('blob:')) return raw
    // Check if it already has data URI prefix
    if (raw.startsWith('data:')) return raw
    // Otherwise assume base64 and prepend prefix
    return `data:${mimeType};base64,${raw}`
  }, [message?.filePath, mimeType])

  const hasPath = !!filePath || !!mediaSrc
  const finalPath = filePath || mediaSrc

  const onCancel = () => {
    if (upProgress == null) return
    uiActions.addCancelId(message?.clientId)
  }

  return (
    <>
      {(isImage || isVideo) && hasPath ? (
        <div className="relative rounded-2xl overflow-hidden max-w-sm group">
          {upProgress != null && (
            <div className="size-full absolute inset-0 bg-black/30 text-white size-20 z-50 flex items-center justify-center z-20 gap-3">
              <div
                className="size-10 rounded-full border border-white flex items-center justify-center"
                onClick={onCancel}
              >
                <X className="size-4" />
              </div>
              <p>{upProgress} %</p>
            </div>
          )}

          {isImage ? (
            <img
              src={finalPath}
              alt={message.fileName}
              className="w-full h-auto max-h-[360px] object-contain pointer-events-none"
              draggable={false}
            />
          ) : (
            <video
              src={finalPath}
              controls
              className="w-full h-auto max-h-[360px] object-contain"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="text-xs text-white truncate">{message.fileName}</div>
            <div className="text-[10px] text-white/80"> {`${sizeData.v} ${sizeData.unit}`} </div>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={upProgress ? undefined : handleDownload}
        >
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center rounded-full shrink-0 relative',
              isMine ? 'bg-blue-500 text-blue-200' : 'bg-blue-200 text-[#3b82f6]'
            )}
          >
            {upProgress != null ? (
              <div
                className="absolute inset-0 flex items-center justify-center z-20"
                onClick={upProgress ? onCancel : undefined}
              >
                {upProgress ? <X /> : <div className="text-[10px] font-bold">{upProgress}%</div>}
                <Loader2 className="size-6 animate-spin absolute opacity-20" />
              </div>
            ) : (
              <>
                {message.filePath ? <File className="size-6" /> : <Download className="size-6" />}
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{message.fileName}</div>
            <div className="flex items-center gap-2">
              <div className="text-xs flex">
                {`${upProgress ? `${((upProgress * sizeData.v) / 100).toFixed(1)} /` : ''}${sizeData.v} ${sizeData.unit}`}
              </div>
              {message.filePath && (
                <div className="px-1.5 py-0.5 rounded bg-green-500/10 text-[10px] text-green-400 font-medium">
                  Local
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {message.content && <p className="text-xs mt-3">{message.content}</p>}
    </>
  )
}

export default React.memo(MessageFile)
