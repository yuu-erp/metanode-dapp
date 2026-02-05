'use client'

import * as React from 'react'
import type { OverlayMessageHandlers, OverlayMessageProps } from './overlay-message.types'
import { useCopyMessageAction, useMessageAction } from '../../contexts'
import { useDeleteMessage, useReactToMessage } from '../../hooks'
import { useDownloadFile } from '../../hooks/use-download-file'
import OverlayMessageView from './overlay-message-view'

function OverlayMessage({ onClose, message, isMine, conversation, account }: OverlayMessageProps) {
  const { setMessageAction } = useMessageAction()
  const { copyMessage } = useCopyMessageAction()
  const { mutate: mutateReactToMessage } = useReactToMessage()
  const { mutate: mutateDelete } = useDeleteMessage()
  const { downloadFile } = useDownloadFile()

  const handleClose = React.useCallback(() => onClose(), [onClose])

  const handlers: OverlayMessageHandlers = React.useMemo(
    () => ({
      onReact: (emoji: string) => {
        if (!message?.id) return
        if (!account || !conversation) return
        mutateReactToMessage({
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
        if (!message?.id) return
        if (!account || !conversation) return
        mutateDelete({
          account,
          conversation,
          message
        })
        handleClose()
      },

      onEdit: () => {
        setMessageAction({
          type: 'EDIT',
          message
        })
        handleClose()
      },

      onSave: () => {
        if (message.type !== 'file' || !message.fileId) return
        const mimeType = message.mimeType || 'application/octet-stream'
        downloadFile(message.id, message.fileId, message.fileName || 'file', mimeType)
        handleClose()
      }
    }),
    [
      account,
      conversation,
      message,
      mutateReactToMessage,
      mutateDelete,
      setMessageAction,
      copyMessage,
      handleClose,
      downloadFile
    ]
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
