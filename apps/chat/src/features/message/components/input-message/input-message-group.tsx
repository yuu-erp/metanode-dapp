import {
  type EditTextPayload,
  type Message,
  type MessageAction,
  type PersistedMessage
} from '@/modules/message'
import * as React from 'react'
import { type InputMessageProps, InputMessageView, useInputMessageController } from '.'
import { useEditGroupMessage, useSendGroupSticker, useSendGroupText } from '../../hooks'

const InputMessageGroup = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation }, ref) => {
    // TODO: Replace with Group specific hooks whenever available
    const { sendText, isPending: _isSendingText } = useSendGroupText()
    const { sendSticker, isPending: _isSendingSticker } = useSendGroupSticker()
    const { mutate: editMessage, isPending: _isEditing } = useEditGroupMessage()

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
      // isSending: isSendingText || isSendingSticker || isEditing,
      isSending: false,
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

export default React.memo(InputMessageGroup)
