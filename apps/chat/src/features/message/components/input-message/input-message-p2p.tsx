'use client'

import * as React from 'react'
import {
  type EditTextPayload,
  type Message,
  type MessageAction,
  type PersistedMessage
} from '@/modules/message'
import { useEditMessage, useSendSticker, useSendText } from '../../hooks'
import { type InputMessageProps, InputMessageView, useInputMessageController } from '.'

const InputMessageP2P = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation }, ref) => {
    const { sendText, isPending: isSendingText } = useSendText()
    const { sendSticker, isPending: isSendingSticker } = useSendSticker()
    const { mutate: editMessage, isPending: isEditing } = useEditMessage()

    const handleSendText = React.useCallback(
      (content: string, messageAction: MessageAction | null) => {
        if (!account || !conversation) return
        sendText({ account, conversation, content, messageAction: messageAction ?? undefined })
      },
      [account, conversation, sendText]
    )

    const handleSendSticker = React.useCallback(
      (stickerId: string, messageAction: MessageAction | null) => {
        if (!account || !conversation) return
        sendSticker({ account, conversation, stickerId, messageAction: messageAction ?? undefined })
      },
      [account, conversation, sendSticker]
    )

    const handleEditMessage = React.useCallback(
      (messageOld: Message, content: string) => {
        if (!account || !conversation) return
        // Ensure message has ID before editing
        if (!messageOld.id) return

        const payload: EditTextPayload = { type: 'text', content }
        editMessage({ account, conversation, messageOld: messageOld as PersistedMessage, payload })
      },
      [account, conversation, editMessage]
    )

    const controller = useInputMessageController({
      account,
      conversation,
      isSending: isSendingText || isSendingSticker || isEditing,
      onSendText: handleSendText,
      onSendSticker: handleSendSticker,
      onEditMessage: handleEditMessage
    })

    React.useImperativeHandle(ref, () => controller.textareaRef.current!)

    return (
      <InputMessageView
        message={controller.message}
        isPending={controller.isPending}
        messageAction={controller.messageAction}
        files={controller.files}
        textareaRef={controller.textareaRef}
        containerRef={controller.containerRef}
        FileInput={controller.FileInput}
        onChangeMessage={controller.setMessage}
        onSend={controller.handleSend}
        onSendSticker={controller.handleSendSticker}
        onOpenFilePicker={controller.openFilePicker}
        onClearAction={controller.clearAction}
        onRemoveFile={controller.handleRemoveFile}
        isStickerDrawerOpen={controller.isStickerDrawerOpen}
        onToggleStickerDrawer={controller.setIsStickerDrawerOpen}
      />
    )
  }
)

export default React.memo(InputMessageP2P)
