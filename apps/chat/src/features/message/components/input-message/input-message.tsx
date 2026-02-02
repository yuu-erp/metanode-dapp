'use client'
import * as React from 'react'
import {
  type InputMessageProps,
  useAttachmentPicker,
  useChatInputLayout,
  useMessageComposer,
  InputMessageView
} from '.'
import { useFileTransfer } from '../../hooks/use-file-transfer'

const InputMessage = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation }, ref) => {
    const composer = useMessageComposer({ account, conversation })
    const layout = useChatInputLayout(composer.message)
    const { sendFile, progress, status } = useFileTransfer(account, conversation)

    const attachment = useAttachmentPicker({
      onSelect: (files) => {
        if (files && files.length > 0) {
          // Send first file for now (WebRTC P2P usually 1-by-1 for simple impl)
          sendFile(files[0])
        }
      }
    })

    React.useImperativeHandle(ref, () => layout.textareaRef.current!)

    return (
      <div className="relative w-full">
        {status !== 'idle' && status !== 'completed' && (
          <div className="absolute -top-1 left-0 right-0 h-1 bg-white/10 z-50 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <InputMessageView
          message={composer.message}
          isPending={composer.isPending || status === 'preparing' || status === 'sending'}
          messageAction={composer.messageAction}
          textareaRef={layout.textareaRef}
          containerRef={layout.containerRef}
          FileInput={attachment.FileInput}
          onChangeMessage={composer.setMessage}
          onSend={composer.sendText}
          onSendSticker={composer.sendSticker}
          onOpenFilePicker={attachment.openFilePicker}
          onClearAction={composer.clearAction}
        />
      </div>
    )
  }
)

export default React.memo(InputMessage)
