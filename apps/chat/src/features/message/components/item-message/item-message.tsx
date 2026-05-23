'use client'
import { usePlatform } from '@/hooks/core/use-platform'
import type { Message } from '@/modules/message'
import { useLongPress } from '@/shared/hooks'

import { container } from '@/container'
import { useEventBus } from '@/shared/hooks/use-eventbus'
import { sendCommand } from '@metanodejs/system-core'
import * as React from 'react'
import { type MessageItemProps } from '.'
import { useDownloadFile, useIsPinned } from '../../hooks'
import ItemMessageUI from './item-message-ui'
import { SystemMessage } from './variants/system-message'

// --- Logic Hook ---
function useMessageLogic(
  message: Message,
  isMine?: boolean,
  onSelectMessage?: (m: Message) => void
) {
  const { isNotPc } = usePlatform()

  // Long-press for mobile devices
  const { handlers: longPressHandlers, isLongPressActive } = useLongPress({
    threshold: 250,
    shouldPreventDefault: true,
    movementThreshold: 12,
    onLongPressStart: () => {},
    onLongPressEnd: () => {
      onSelectMessage?.(message)
      sendCommand('vibrate')
    }
  })

  // Context menu for PC
  const handleContextMenu = React.useCallback(
    (e: React.MouseEvent) => {
      if (isNotPc) return
      e.preventDefault()
      onSelectMessage?.(message)
    },
    [isNotPc, message, onSelectMessage]
  )

  // Use long-press for mobile, context menu for PC
  const handlers = isNotPc ? longPressHandlers : { onContextMenu: handleContextMenu }

  // status logic
  const isFailed = isMine && message.status === 'failed'

  return { handlers, isLongPressActive, isFailed }
}

// --- Main Component ---

function ItemMessage(
  props: MessageItemProps<Message> & {
    isOverlay?: boolean
  }
) {
  const { message, isMine, onSelectMessage, isOverlay } = props
  const logic = useMessageLogic(message, isMine, onSelectMessage)
  const { downloadFile } = useDownloadFile()

  if (message.type === 'call_status') {
    console.log('[ItemMessage]', { message })
  }
  const isSticker = message.type === 'sticker'
  //@ts-ignore
  const mimeType = message?.message?.mimeType ?? message.mimeType
  const { data: isPinned } = useIsPinned(message.id)

  const isImage = React.useMemo(() => {
    if (message.type !== 'file') return false

    if (!mimeType.startsWith('image/')) return false
    // use cachedFile (async) or filePath (sync) to determing if image styling applies
    //@ts-ignore
    return !!message?.filePath
  }, [message, mimeType])

  const isVideo = React.useMemo(() => {
    if (message.type !== 'file') return false
    if (!mimeType.startsWith('video/')) return false
    return !!message.filePath
  }, [message, mimeType])

  useEventBus('file.download', async (e) => {
    if (isOverlay) return
    if (e.messageId !== message.id) return
    const fileId = message.fileId || message.id
    console.log('[file.download] 1', { fileId })
    if (!fileId) return
    await downloadFile(fileId, fileId, message.fileName, message.mimeType)
    const file = await container.fileCacheService.getFile(fileId)
    console.log('[file.download] 2', { file })

    if (!file) return
    const url = URL.createObjectURL(file.blob)
    console.log('[file.download] 3', { url })

    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  })

  if (message.type === 'system') {
    return <SystemMessage message={message} {...logic} />
  }

  return (
    <ItemMessageUI
      {...props}
      {...logic}
      isSticker={isSticker}
      isImage={isImage}
      isVideo={isVideo}
      isPinned={isPinned}
    />
  )
}

export default React.memo(ItemMessage)
