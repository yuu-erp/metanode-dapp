'use client'

import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { Message, MessageAction } from '@/modules/message'
import { useMessageAction } from '../../contexts'

interface UseMessageComposerParams {
  account?: Account
  conversation?: Conversation
  isSending?: boolean
  onSendText: (content: string, messageAction: MessageAction | null) => void
  onSendSticker: (stickerId: string, messageAction: MessageAction | null) => void
  onEditMessage: (messageOld: Message, content: string) => void
}

export function useMessageComposer({
  account,
  conversation,
  isSending = false,
  onSendText,
  onSendSticker,
  onEditMessage
}: UseMessageComposerParams) {
  const [message, setMessage] = React.useState('')

  const { messageAction, setMessageAction } = useMessageAction()

  const isEdit = messageAction?.type === 'EDIT'

  const canSend = Boolean(account && conversation && !isSending)

  const handleSendText = React.useCallback(() => {
    if (!canSend) return

    const content = message.trim()

    // ✏️ EDIT MESSAGE (TEXT ONLY)
    if (isEdit && messageAction?.message) {
      onEditMessage(messageAction.message, content)

      setMessage('')
      setMessageAction(null)
      return
    }

    // 📤 SEND NEW MESSAGE
    onSendText(content, messageAction)

    setMessage('')
    setMessageAction(null)
  }, [canSend, message, messageAction, isEdit, onSendText, onEditMessage, setMessageAction])

  const handleSendSticker = React.useCallback(
    (stickerId: string) => {
      if (!canSend) return
      // 📤 SEND NEW MESSAGE
      onSendSticker(stickerId, messageAction)

      setMessage('')
      setMessageAction(null)
    },
    [canSend, messageAction, onSendSticker, setMessageAction]
  )

  React.useEffect(() => {
    if (!messageAction || messageAction.type !== 'EDIT') return
    if (messageAction.message.type !== 'text') return
    setMessage(messageAction.message.content)
  }, [messageAction])

  return {
    message,
    setMessage,

    canSend,
    isPending: isSending,

    messageAction,
    clearAction: () => setMessageAction(null),

    sendText: handleSendText,
    sendSticker: handleSendSticker
  }
}
