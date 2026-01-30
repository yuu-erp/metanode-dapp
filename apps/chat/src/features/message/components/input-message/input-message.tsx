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
    const composer = useMessageComposer({ account, conversation })
    const layout = useChatInputLayout(composer.message)
    const attachment = useAttachmentPicker()

    React.useImperativeHandle(ref, () => layout.textareaRef.current!)

    return (
      <InputMessageView
        message={composer.message}
        isPending={composer.isPending}
        messageAction={composer.messageAction}
        textareaRef={layout.textareaRef}
        containerRef={layout.containerRef}
        FileInput={attachment.FileInput}
        onChangeMessage={composer.setMessage}
        onSend={composer.sendText}
        onOpenFilePicker={attachment.openFilePicker}
        onClearAction={composer.clearAction}
      />
    )
  }
)

export default React.memo(InputMessage)
