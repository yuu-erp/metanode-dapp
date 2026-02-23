'use client'
import type { MessageAction } from '@/modules/message'
import { StickerIcon } from '@/shared/components/icons'
import { cn } from '@/shared/lib'
import { Mic, Paperclip, Send } from 'lucide-react'
import * as React from 'react'
import { InputMessageAction } from '.'
import { SelectedFileList } from './selected-file-list'
import { StickerDrawer } from './sticker-drawer'

export interface InputMessageViewProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  isPending: boolean
  messageAction: MessageAction | null
  files: File[]

  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>

  FileInput: React.ReactNode

  onChangeMessage: (value: string) => void
  onSend: () => void
  onSendSticker: (stickerId: string) => void
  onOpenFilePicker: () => void
  onClearAction: () => void
  onRemoveFile: (index: number) => void
  isStickerDrawerOpen: boolean
  onToggleStickerDrawer: (open: boolean) => void
}

function InputMessageView(props: InputMessageViewProps) {
  const {
    message,
    isPending,
    messageAction,
    files,
    textareaRef,
    containerRef,
    FileInput,
    onChangeMessage,
    onSend,
    onSendSticker,
    onOpenFilePicker,
    onClearAction,
    onRemoveFile,
    isStickerDrawerOpen,
    onToggleStickerDrawer,
    ...propsDiv
  } = props

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 banner__overlay--down"
      {...propsDiv}
    >
      <div className="pb-5">
        <div className="w-full min-h-[72px] h-full flex items-end gap-1 px-2">
          {/* Attach */}
          <button
            type="button"
            onClick={onOpenFilePicker}
            className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
          >
            <Paperclip className="text-white/80" />
          </button>

          {FileInput}

          {/* Input */}
          <div className="relative flex-1 rounded-4xl overflow-hidden">
            {/* BLUR LAYER – KHÔNG SCROLL */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-2xl pointer-events-none"
              aria-hidden
            />

            {/* CONTENT LAYER – SCROLL Ở ĐÂY */}
            <div
              className={cn(
                'relative h-full pb-2 flex flex-col gap-1',
                !message.trim() ? 'px-2' : 'px-1',
                files.length > 0 ? 'pt-0' : 'pt-2'
              )}
            >
              <InputMessageAction messageAction={messageAction} onClearAction={onClearAction} />
              <SelectedFileList files={files} onRemove={onRemoveFile} />
              <div className="w-full h-full flex items-end">
                <div className="no-scrollbar min-h-8 max-h-60 h-full flex-1 flex items-center overflow-y-auto pl-1">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Tin nhắn"
                    value={message}
                    onChange={(e) => onChangeMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing) return
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSend()
                      }
                    }}
                    className="w-full h-full resize-none bg-transparent outline-none border-none placeholder:text-white/60 text-white"
                  />
                </div>

                <div className="h-8 flex items-center gap-1">
                  <button onClick={() => onToggleStickerDrawer(true)}>
                    <StickerIcon className="text-white/80" />
                  </button>

                  {message.trim() || files.length > 0 ? (
                    <button
                      disabled={isPending}
                      onClick={onSend}
                      className="h-10 w-12 bg-blue-500 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform duration-150 active:scale-80"
                    >
                      <Send className="text-white size-5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Mic */}
          {!message.trim() && files.length === 0 && (
            <button className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80">
              <Mic className="text-white/80" />
            </button>
          )}
        </div>
      </div>
      <StickerDrawer
        open={isStickerDrawerOpen}
        onOpenChange={onToggleStickerDrawer}
        onSendSticker={onSendSticker}
      />
    </div>
  )
}

export default React.memo(InputMessageView)
