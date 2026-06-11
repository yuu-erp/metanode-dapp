'use client'
import { usePlatform } from '@/hooks/core/use-platform'
import type { Message } from '@/modules/message'
import { useCurrentAccount, useLongPress } from '@/shared/hooks'

import { fileHandler } from '@/clients'
import { useMessageById } from '@/hooks/mesage/use-message-by-id'
import { useIsPinned } from '@/new/message'
import { useEventBus } from '@/shared/hooks/use-eventbus'
import { messageActions } from '@/stores/message.store'
import { uiActions } from '@/stores/ui.store'
import { sendCommand } from '@metanodejs/system-core'
import * as React from 'react'
import { type MessageItemProps } from '.'
import ItemMessageUI from './item-message-ui'
import { SystemMessage } from './variants/system-message'
import { downloadFileV2 } from '@/new/file-v2'

// --- Logic Hook ---
function useMessageLogic(
  message: Message,
  isMine?: boolean,
  onSelectMessage?: (m: Message) => void
) {
  const { isNotWeb } = usePlatform()

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
      if (isNotWeb) return
      e.preventDefault()
      onSelectMessage?.(message)
    },
    [isNotWeb, message, onSelectMessage]
  )

  // Use long-press for mobile, context menu for PC
  const handlers = isNotWeb ? longPressHandlers : { onContextMenu: handleContextMenu }

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
  const { message, onSelectMessage, isOverlay = false } = props
  const isMine = useMessageById(message.id, (s) => s?.isMine ?? props?.isMine)

  const logic = useMessageLogic(message, isMine, onSelectMessage)
  const { data: account } = useCurrentAccount()

  const isSticker = message.type === 'sticker'

  const mimeType = useMessageById(message.id, (s) => s?.mimeType)

  const { isPinned } = useIsPinned(message.id)

  const isImage = mimeType?.startsWith('image')

  const isVideo = React.useMemo(() => {
    if (message.type !== 'file') return false
    if (!mimeType?.startsWith('video/')) return false
    return !!message.filePath
  }, [message, mimeType])

  useEventBus('file.download', async (e) => {
    if (isOverlay) return
    if (e.message.id !== message.id) return
    const fileId = message.fileId
    const messageId = message.id
    if (!fileId || !account) return
    const { blob, meta } = await downloadFileV2(fileId)
    // const { blob, meta } = await fileHandler.downloadFile(fileId, account, {
    //   onProgress: (v) => {
    //     uiActions.setUpFileProgress(messageId, v)
    //   }
    // })
    const path = URL.createObjectURL(blob)
    messageActions.setMessage(messageId, { filePath: path, mimeType: meta.mimeType })
    if (e.saveByWeb && 'showSaveFilePicker' in window) {
      let ext: string = meta.fileName.match(/\.[^.]+$/)?.[0] ?? ''
      ext = ext.split('_')[0]
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: meta.fileName,
        types: [
          {
            description: 'desc',
            accept: {
              [meta.mimeType]: [ext]
            }
          }
        ]
      })

      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      // const a = document.createElement('a')
      // a.href = path
      // a.download = 'file.zip'
      // a.click()
    }
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
