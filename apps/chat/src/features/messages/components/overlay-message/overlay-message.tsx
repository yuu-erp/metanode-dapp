'use client'

import * as React from 'react'
import type { OverlayMessageHandlers, OverlayMessageProps } from './overlay-message.types'
import { useCopyMessageAction, useMessageAction } from '../../contexts'
import { useReactToMessage } from '../../hooks'
import OverlayMessageView from './overlay-message-view'

function OverlayMessage({ onClose, message, isMine, conversation, account }: OverlayMessageProps) {
  const { setMessageAction } = useMessageAction()
  const { copyMessage } = useCopyMessageAction()
  const { mutate } = useReactToMessage()

  const handleClose = React.useCallback(() => onClose(), [onClose])

  const handlers: OverlayMessageHandlers = React.useMemo(
    () => ({
      onReact: (emoji: string) => {
        if (!message?.id) return
        if (!account || !conversation) return
        mutate({
          account,
          conversation,
          payload: {
            messageId: message.id,
            emoji
          }
        })
        handleClose()
      },

      onReply: () => {
        setMessageAction({
          type: 'REPLY',
          message
        })
        handleClose()
      },

      onCopy: () => {
        copyMessage(message.type === 'text' ? message.content : '')
        handleClose()
      },

      onForward: () => {
        setMessageAction({
          type: 'FORWARD',
          message
        })
        handleClose()
      },

      onDelete: () => {
        handleClose()
      },

      onEdit: () => {
        setMessageAction({
          type: 'EDIT',
          message
        })
        handleClose()
      }
    }),
    [account, conversation, message, mutate, setMessageAction, copyMessage, handleClose]
  )

  return (
    <OverlayMessageView
      message={message}
      isMine={isMine}
      handlers={handlers}
      onClose={handleClose}
    />
  )
}

export default React.memo(OverlayMessage)
