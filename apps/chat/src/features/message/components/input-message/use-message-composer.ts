'use client'

import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import type { EditTextPayload, MessageAction } from '@/modules/message'
import { useMessageAction } from '../../contexts'
import { useEditMessage, useSendSticker, useSendText } from '../../hooks'

interface UseMessageComposerParams {
  account?: Account
  conversation?: Conversation
}

export function useMessageComposer({ account, conversation }: UseMessageComposerParams) {
  const [message, setMessage] = React.useState('')

  const { messageAction, setMessageAction } = useMessageAction()

  const { sendText, isPending: isSending } = useSendText()
  const { sendSticker, isPending: isSendingSticker } = useSendSticker()
  const { mutate: editMessage, isPending: isEditing } = useEditMessage()

  const isEdit = messageAction?.type === 'EDIT'

  const canSend = Boolean(account && conversation && !isSending && !isEditing && !isSendingSticker)

  const handleSendText = React.useCallback(() => {
    if (!canSend || !account || !conversation) return

    const content = message.trim()

    // ✏️ EDIT MESSAGE (TEXT ONLY)
    if (isEdit && messageAction?.message) {
      const payload: EditTextPayload = {
        type: 'text',
        content
      }

      editMessage({
        account,
        conversation,
        messageOld: messageAction.message,
        payload
      })

      setMessage('')
      setMessageAction(null)
      return
    }

    // 📤 SEND NEW MESSAGE
    sendText({
      account,
      conversation,
      content,
      messageAction: messageAction as MessageAction
    })

    setMessage('')
    setMessageAction(null)
  }, [
    canSend,
    account,
    conversation,
    message,
    messageAction,
    isEdit,
    sendText,
    editMessage,
    setMessageAction
  ])

  const handleSendSticker = React.useCallback(
    (stickerId: string) => {
      console.log('[handleSendSticker]', {
        stickerId,
        canSend,
        account,
        conversation
      })
      if (!canSend || !account || !conversation) return
      // 📤 SEND NEW MESSAGE
      sendSticker({
        account,
        conversation,
        stickerId,
        messageAction: messageAction as MessageAction
      })

      setMessage('')
      setMessageAction(null)
    },
    [
      canSend,
      account,
      conversation,
      message,
      messageAction,
      isEdit,
      sendSticker,
      editMessage,
      setMessageAction
    ]
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
    isPending: isSending || isEditing || isSendingSticker,

    messageAction,
    clearAction: () => setMessageAction(null),

    sendText: handleSendText,
    sendSticker: handleSendSticker
  }
}
