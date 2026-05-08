import { MentionPopover } from '@/components/mention-popover'
import {
  type EditTextPayload,
  type Message,
  type MessageAction,
  type PersistedMessage
} from '@/modules/message'
import { buildRawValue, type Mention } from '@/shared/lib'
import { uiActions, useUiStore } from '@/stores/ui.store'
import * as React from 'react'
import { type InputMessageProps, InputMessageView, useInputMessageController } from '.'
import { useEditGroupMessage, useSendGroupSticker, useSendGroupText } from '../../hooks'

const InputMessageGroup = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation }, ref) => {
    // TODO: Replace with Group specific hooks whenever available
    const { sendText, isPending: _isSendingText } = useSendGroupText()
    const { sendSticker, isPending: _isSendingSticker } = useSendGroupSticker()
    const { mutate: editMessage, isPending: _isEditing } = useEditGroupMessage()
    const mentionOpen = useUiStore((s) => s.mentionPopoverOpen)
    const pendingMention = useUiStore((s) => s.pendingMention)

    const [mentions, setMentions] = React.useState<Mention[]>([])

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

    const formatOutgoingText = React.useCallback(
      (display: string) => buildRawValue(display, mentions),
      [mentions]
    )

    const controller = useInputMessageController({
      account,
      conversation,
      // isSending: isSendingText || isSendingSticker || isEditing,
      isSending: false,
      formatOutgoingText,
      onSendText: handleSendText,
      onSendSticker: handleSendSticker,
      onEditMessage: handleEditMessage
    })

    React.useImperativeHandle(ref, () => controller.textareaRef.current!)

    const displayValue = controller.message

    React.useEffect(() => {
      if (!displayValue) {
        setMentions([])
      }
    }, [displayValue])

    React.useEffect(() => {
      const lastChar = displayValue.slice(-2)
      if (lastChar === ' @' && !mentionOpen) {
        uiActions.setMentionPopoverOpen(true)
      } else if (mentionOpen && displayValue.slice(-1) === ' ') {
        uiActions.setMentionPopoverOpen(false)
      }
    }, [displayValue, mentionOpen])

    React.useEffect(() => {
      if (!pendingMention) return
      const { id, display } = pendingMention
      controller.setMessage((prev) => `${prev}${display} `)
      setMentions((prev) => {
        const rest = prev.filter((m) => m.id !== id)
        return [...rest, { id, display }]
      })
      uiActions.setPendingMention(null)
      controller.textareaRef.current?.focus()
    }, [pendingMention, controller.setMessage, controller.textareaRef])

    return (
      <InputMessageView
        onRemoveFileData={controller.onRemoveFileData}
        fileData={controller.fileData}
        setFileData={controller.setFileData}
        node={<MentionPopover />}
        mentionHighlights={mentions}
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
        setFiles={controller.setFiles}
      />
    )
  }
)

export default React.memo(InputMessageGroup)
