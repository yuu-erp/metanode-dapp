'use client'
import { useSendMessageV2 } from '@/hooks/mesage/use-send-message-v2'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'

export function useSendText() {
  const { mutate, ...rest } = useSendMessageV2()

  const sendText = React.useCallback(
    (
      params: Omit<any, 'payload'> & {
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
        payload
      })
    },
    [mutate]
  )

  return { sendText, ...rest }
}
