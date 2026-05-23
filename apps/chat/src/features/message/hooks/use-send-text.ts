'use client'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'
import { useSendMessage, type SendMessageVariables } from '.'

export function useSendText() {
  const { mutate, ...rest } = useSendMessage()

  const sendText = React.useCallback(
    (
      params: Omit<SendMessageVariables, 'payload'> & {
        content: string
        messageAction?: MessageAction
      }
    ) => {
      const payload = createSendPayload(
        { type: 'text', content: params.content },
        params.messageAction
      )
      console.log('[useSendText]', { payload, params })
      mutate({
        account: params.account,
        conversation: params.conversation,
        payload
      })
    },
    [mutate]
  )

  return { sendText, ...rest }
}
