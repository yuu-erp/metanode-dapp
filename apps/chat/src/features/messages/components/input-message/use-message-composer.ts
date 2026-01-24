'use client'

import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { useMessageAction } from '../../contexts'
import { useSendText } from '../../hooks'
import type { MessageAction } from '@/modules/message'

interface UseMessageComposerParams {
  account?: Account
  conversation?: Conversation
}

export function useMessageComposer({ account, conversation }: UseMessageComposerParams) {
  const [message, setMessage] = React.useState('')
  const { messageAction, setMessageAction } = useMessageAction()
  const { sendText, isPending } = useSendText()

  const canSend = Boolean(message.trim() && account && conversation && !isPending)

  const handleSendText = React.useCallback(() => {
    if (!canSend || !account || !conversation) return
    sendText({
      account,
      conversation,
      content: message.trim(),
      messageAction: { ...messageAction } as MessageAction
    })

    setMessage('')
    setMessageAction(null)
  }, [canSend, account, conversation, message, messageAction, sendText, setMessageAction])

  return {
    message,
    setMessage,
    canSend,
    isPending,
    messageAction,
    clearAction: () => setMessageAction(null),
    sendText: handleSendText
  }
}
