'use client'
import { useSendMessage } from '@/hooks/mesage/use-send-message'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'

export function useSendSticker() {
  const { mutate, ...rest } = useSendMessage()

  const sendSticker = React.useCallback(
    (
      params: Omit<any, 'payload'> & {
        stickerId: string
        messageAction?: MessageAction
      },
    ) => {
      const payload = createSendPayload(
        { type: 'sticker', stickerId: params.stickerId },
        params.messageAction,
      )

      mutate({
        payload,
      })
    },
    [mutate],
  )

  return { sendSticker, ...rest }
}
