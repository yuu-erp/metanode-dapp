import { useInputMessageController } from '@/features/message'
import InputMessageView from '@/features/message/components/input-message/input-message-view'
import { useSendSticker, useSendText } from '@/features/message/hooks'
import { useEditMessage } from '@/hooks/mesage/use-edit-message'
import type { Conversation } from '@/modules/conversation'
import { type Message, type MessageAction } from '@/modules/message'
import { useCurrentAccount, useGetConversationId } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { buildRawValue, type Mention } from '@/shared/lib'
import { fileActions } from '@/stores/file.store'
import { uiActions, useUiStore } from '@/stores/ui.store'
import * as React from 'react'

const MessageInput = React.forwardRef<HTMLTextAreaElement>(({}, ref) => {
  // TODO: Replace with Group specific hooks whenever available
  const { sendText, isPending: _isSendingText } = useSendText()
  const { sendSticker, isPending: _isSendingSticker } = useSendSticker()
  const { mutate: editMessage, isPending: _isEditing } = useEditMessage()
  const mentionOpen = useUiStore((s) => s.mentionPopoverOpen)
  const pendingMention = useUiStore((s) => s.pendingMention)
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()
  const { data: conversation } = useGetConversationId(id, type)

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
    (messageOld: Message) => {
      if (!account || !conversation) return
      // Ensure message has ID before editing
      if (!messageOld.id) return

      // const payload: EditTextPayload = { type: 'text', content }
      // editMessage({ messageOld: messageOld as PersistedMessage, payload })
    },
    [account, conversation, editMessage]
  )

  const formatOutgoingText = React.useCallback(
    (display: string) => buildRawValue(display, mentions),
    [mentions]
  )

  const controller = useInputMessageController({
    account,
    conversation: conversation as Conversation | undefined,
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

  React.useEffect(() => {
    fileActions.reset()
  }, [])

  return (
    <>
      <div />
      <div contentEditable={true} id="editor"></div>
      <InputMessageView mentionHighlights={mentions} messageAction={controller.messageAction} />
    </>
  )
})

export default React.memo(MessageInput)
