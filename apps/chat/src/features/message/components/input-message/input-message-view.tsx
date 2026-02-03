'use client'
import type { MessageAction } from '@/modules/message'
import { StickerIcon } from '@/shared/components/icons'
import { cn } from '@/shared/lib'
import { Mic, Paperclip, Send } from 'lucide-react'
import * as React from 'react'
import { InputMessageAction } from '.'

export interface InputMessageViewProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  isPending: boolean
  messageAction: MessageAction | null

  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>

  FileInput: React.ReactNode

  onChangeMessage: (value: string) => void
  onSend: () => void
  onSendSticker: (stickerId: string) => void
  onOpenFilePicker: () => void
  onClearAction: () => void
}

function InputMessageView(props: InputMessageViewProps) {
  const {
    message,
    isPending,
    messageAction,
    textareaRef,
    containerRef,
    FileInput,
    onChangeMessage,
    onSend,
    onSendSticker,
    onOpenFilePicker,
    onClearAction,
    ...propsDiv
  } = props

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 banner__overlay--down"
      {...propsDiv}
    >
      <div className="pb-5">
        <div className="w-full min-h-[72px] h-full flex items-end gap-1.5 px-3">
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
                'relative h-full py-2 px-2 flex flex-col gap-1',
                !message.trim() ? 'px-2' : 'px-1'
              )}
            >
              <InputMessageAction messageAction={messageAction} onClearAction={onClearAction} />
              <div className="w-full h-full flex items-end">
                <div className="no-scrollbar min-h-8 max-h-60 h-full flex-1 flex items-center overflow-y-auto pl-1">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Tin nhắn"
                    value={message}
                    onChange={(e) => onChangeMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        onSend()
                      }
                    }}
                    className="w-full h-full resize-none bg-transparent outline-none border-none placeholder:text-white/60 text-white"
                  />
                </div>

                <div className="h-8 flex items-center gap-1">
                  <button onClick={() => onSendSticker('174bea63d6263f786637')}>
                    <StickerIcon className="text-white/80" />
                  </button>

                  {message.trim() && (
                    <button
                      disabled={isPending}
                      onClick={onSend}
                      className="h-10 w-12 bg-blue-500 rounded-full flex items-center justify-center disabled:opacity-50 transition-transform duration-150 active:scale-80"
                    >
                      <Send className="text-white size-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mic */}
          {!message.trim() && (
            <button className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80">
              <Mic className="text-white/80" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(InputMessageView)
