'use client'
import { usePlatform } from '@/hooks/core/use-platform'
import type { Message } from '@/modules/message'
import { useLongPress } from '@/shared/hooks'

import { useMessageById } from '@/hooks/mesage/use-message-by-id'
import { useIsPinned } from '@/new/message'
import { sendCommand } from '@metanodejs/system-core'
import * as React from 'react'
import { type MessageItemProps } from '.'
import ItemMessageUI from './item-message-ui'
import { SystemMessage } from './variants/system-message'

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
  console.log(isOverlay)
  const isSticker = message.type === 'sticker'

  const mimeType = useMessageById(message.id, (s) => s?.mimeType)

  const { isPinned } = useIsPinned(message.id)

  const isImage = mimeType?.startsWith('image')

  const isVideo = React.useMemo(() => {
    if (message.type !== 'file') return false
    if (!mimeType?.startsWith('video/')) return false
    return !!message.filePath
  }, [message, mimeType])

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
