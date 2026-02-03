'use client'
import * as React from 'react'
import {
  type InputMessageProps,
  useAttachmentPicker,
  useChatInputLayout,
  useMessageComposer,
  InputMessageView
} from '.'

const InputMessage = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation }, ref) => {
    const [files, setFiles] = React.useState<File[]>([])
    const composer = useMessageComposer({ account, conversation })
    const layout = useChatInputLayout(composer.message)
    const attachment = useAttachmentPicker({
      onSelect: (newFiles) => setFiles((prev) => [...prev, ...newFiles])
    })

    const handleRemoveFile = React.useCallback((index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index))
    }, [])

    React.useImperativeHandle(ref, () => layout.textareaRef.current!)

    return (
      <InputMessageView
        message={composer.message}
        isPending={composer.isPending}
        messageAction={composer.messageAction}
        files={files}
        textareaRef={layout.textareaRef}
        containerRef={layout.containerRef}
        FileInput={attachment.FileInput}
        onChangeMessage={composer.setMessage}
        onSend={composer.sendText}
        onSendSticker={composer.sendSticker}
        onOpenFilePicker={attachment.openFilePicker}
        onClearAction={composer.clearAction}
        onRemoveFile={handleRemoveFile}
      />
    )
  }
)

export default React.memo(InputMessage)
