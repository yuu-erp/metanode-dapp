'use client'
import * as React from 'react'
import {
  type InputMessageProps,
  useAttachmentPicker,
  useChatInputLayout,
  useMessageComposer,
  InputMessageView
} from '.'
import { useSendFile } from '../../hooks'

const InputMessage = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation }, ref) => {
    const [files, setFiles] = React.useState<File[]>([])
    const composer = useMessageComposer({ account, conversation })
    const layout = useChatInputLayout(composer.message)

    const attachment = useAttachmentPicker({
      onSelect: (newFiles) => setFiles((prev) => [...prev, ...newFiles])
    })

    const { mutate: sendFile, isPending: isSendingFile } = useSendFile()

    const handleRemoveFile = React.useCallback((index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const handleSendFile = React.useCallback(() => {
      if (!account || !conversation || !files.length) return
      sendFile({ account, conversation, files })
      setFiles([])
    }, [account, conversation, files, sendFile])

    const handleSend = React.useCallback(() => {
      if (files.length > 0) {
        handleSendFile()
      }
      if (composer.message.trim()) {
        composer.sendText()
      }
    }, [files.length, handleSendFile, composer.message, composer.sendText])

    React.useImperativeHandle(ref, () => layout.textareaRef.current!)

    return (
      <InputMessageView
        message={composer.message}
        isPending={composer.isPending || isSendingFile}
        messageAction={composer.messageAction}
        files={files}
        textareaRef={layout.textareaRef}
        containerRef={layout.containerRef}
        FileInput={attachment.FileInput}
        onChangeMessage={composer.setMessage}
        onSend={handleSend}
        onSendSticker={composer.sendSticker}
        onOpenFilePicker={attachment.openFilePicker}
        onClearAction={composer.clearAction}
        onRemoveFile={handleRemoveFile}
      />
    )
  }
)

export default React.memo(InputMessage)
