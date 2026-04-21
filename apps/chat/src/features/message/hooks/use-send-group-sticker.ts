'use client'
import { createSendPayload, type MessageAction } from '@/modules/message'
import * as React from 'react'
import { type SendMessageVariables } from '.'
import { useSendGroupMessage } from './use-send-group-message'

export function useSendGroupSticker() {
  const { mutate, ...rest } = useSendGroupMessage()

  const sendSticker = React.useCallback(
    (
      params: Omit<SendMessageVariables, 'payload'> & {
        stickerId: string
        messageAction?: MessageAction
      }
    ) => {
      const payload = createSendPayload(
        { type: 'sticker', stickerId: params.stickerId },
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

  return { sendSticker, ...rest }
}
