'use client'
import * as React from 'react'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { createReplyReference } from '@/modules/message/message.entity'
import { useMessageAction } from '../../contexts'
import { useSendMessage } from '../../hooks'

interface UseMessageComposerParams {
  account?: Account
  conversation?: Conversation
}

export function useMessageComposer({ account, conversation }: UseMessageComposerParams) {
  const [message, setMessage] = React.useState('')
  const { messageAction, setMessageAction } = useMessageAction()
  const { mutate, isPending } = useSendMessage()

  const canSend = Boolean(message.trim() && account && conversation && !isPending)

  const sendText = React.useCallback(() => {
    if (!canSend || !account || !conversation) return

    const content = message.trim()

    const replyTo =
      messageAction?.type === 'REPLY' && messageAction.message?.id
        ? createReplyReference({
            ...messageAction.message,
            id: messageAction.message.id
          })
        : undefined

    mutate({
      account,
      conversation,
      payload: {
        type: 'text',
        content,
        replyTo
      }
    })

    setMessage('')
    setMessageAction(null)
  }, [account, conversation, message, canSend, mutate, messageAction, setMessageAction])

  return {
    message,
    setMessage,
    canSend,
    isPending,
    messageAction,
    clearAction: () => setMessageAction(null),
    sendText
  }
}
