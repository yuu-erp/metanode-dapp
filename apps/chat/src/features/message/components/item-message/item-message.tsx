'use client'
import type { Message } from '@/modules/message'
import { useLongPress } from '@/shared/hooks'
import { sendCommand } from '@metanodejs/system-core'
import * as React from 'react'
import { type MessageItemProps } from '.'
import ItemMessageUI from './item-message-ui'

// --- Logic Hook ---
function useMessageLogic(
  message: Message,
  isMine?: boolean,
  onSelectMessage?: (m: Message) => void
) {
  const { handlers, isLongPressActive } = useLongPress({
    threshold: 250,
    shouldPreventDefault: true,
    movementThreshold: 12,
    onLongPressStart: () => {},
    onLongPressEnd: () => {
      onSelectMessage?.(message)
      sendCommand('vibrate')
    }
  })

  // status logic
  const isFailed = isMine && message.status === 'failed'

  return { handlers, isLongPressActive, isFailed }
}

// --- Specialized Wrappers ---

const FileItemMessage = React.memo((props: MessageItemProps<Message>) => {
  const { message, isMine, onSelectMessage } = props
  const logic = useMessageLogic(message, isMine, onSelectMessage)

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

  return <ItemMessageUI {...props} {...logic} isImage={isImage} isVideo={isVideo} />
})

const StandardItemMessage = React.memo((props: MessageItemProps<Message>) => {
  const { message, isMine, onSelectMessage } = props
  const logic = useMessageLogic(message, isMine, onSelectMessage)

  const isSticker = message.type === 'sticker'

  return <ItemMessageUI {...props} {...logic} isSticker={isSticker} />
})

// --- Main Component ---

function ItemMessage(props: MessageItemProps<Message>) {
  if (props.message.type === 'file') {
    return <FileItemMessage {...props} />
  }
  return <StandardItemMessage {...props} />
}

export default React.memo(ItemMessage)
