'use client'
import { usePlatform } from '@/hooks/core/use-platform'
import type { Message } from '@/modules/message'
import { useLongPress } from '@/shared/hooks'

import { sendCommand } from '@metanodejs/system-core'
import * as React from 'react'
import { type MessageItemProps } from '.'
import { useIsPinned } from '../../hooks'
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
  const { message, isMine, onSelectMessage } = props
  const logic = useMessageLogic(message, isMine, onSelectMessage)

  const isSticker = message.type === 'sticker'

  const isImage = React.useMemo(() => {
    if (message.type !== 'file') return false
    if (!message.mimeType.startsWith('image/')) return false
    // use cachedFile (async) or filePath (sync) to determing if image styling applies
    return !!message.filePath
  }, [message])

  const isVideo = React.useMemo(() => {
    if (message.type !== 'file') return false
    if (!message.mimeType.startsWith('video/')) return false
    return !!message.filePath
  }, [message])

  if (message.type === 'system') {
    return <SystemMessage message={message} />
  }

  console.log('thanhduy - test props', props)
  // const {} use

  // const { data: isPinned } = useMessagePinStatus(
  //   account?.address || '',
  //   conversation?.conversationId || '',
  //   message?.id || ''
  // )

  const { data: isPinned } = useIsPinned(message.id)

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
