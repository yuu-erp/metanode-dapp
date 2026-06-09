'use client'
import { useSendMessageV2 } from '@/hooks/mesage/use-send-message-v2'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'

export function useSendSticker() {
  const { mutate, ...rest } = useSendMessageV2()

  const sendSticker = React.useCallback(
    (
      params: Omit<any, 'payload'> & {
        stickerId: string
        messageAction?: MessageAction
      }
    ) => {
      const payload = createSendPayload(
        { type: 'sticker', stickerId: params.stickerId },
        params.messageAction
      )

      mutate({
        payload
      })
    },
    [mutate]
  )

  return { sendSticker, ...rest }
}
