'use client'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'
import { type SendMessageVariables } from '.'
import { useSendGroupMessage } from './use-send-group-message'

export function useSendGroupText() {
  const { mutate, ...rest } = useSendGroupMessage()

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
