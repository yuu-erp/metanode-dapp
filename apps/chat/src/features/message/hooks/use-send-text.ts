'use client'
import { useSendMessage } from '@/hooks/mesage/use-send-message'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'

export function useSendText() {
  const { mutate, ...rest } = useSendMessage()

  const sendText = React.useCallback(
    (
      params: Omit<any, 'payload'> & {
        content: string
        messageAction?: MessageAction
      },
    ) => {
      const payload = createSendPayload(
        { type: 'text', content: params.content },
        params.messageAction,
      )
      console.log('[useSendText]', { payload, params })
      mutate({
        payload,
      })
    },
    [mutate],
  )

  return { sendText, ...rest }
}
