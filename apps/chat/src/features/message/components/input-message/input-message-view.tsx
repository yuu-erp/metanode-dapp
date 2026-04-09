'use client'
import type { MessageAction } from '@/modules/message'
import { StickerIcon } from '@/shared/components/icons'
import { cn } from '@/shared/lib'
import { Mic, Paperclip, Send } from 'lucide-react'
import * as React from 'react'
import { InputMessageAction } from '.'
import { SelectedFileList } from './selected-file-list'
import { StickerDrawer } from './sticker-drawer'
import { usePlatform } from '@/shared/hooks'
import { chooseGalery, getBase64FromPath, takePicture } from '@metanodejs/system-core'
import { PopoverForAndroid } from '../popover-for-android'
import { base64ToFile } from '@/shared/lib'

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
  setFiles: (files: File[]) => void
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
    setFiles,
    ...propsDiv
  } = props

  const { data } = usePlatform()

  const handleSetFile = async (path: string) => {
    const formatPath = path.replace('image://img.m.pro', '')
    const base64 = (await getBase64FromPath(formatPath)).base64
    const file = base64ToFile(base64, 'image.jpg', 'image/jpeg')

    setFiles([file])
  }

  const handleSelectFiles = async () => {
    const path = (await chooseGalery()).path
    await handleSetFile(path)
  }

  const handleTakePicture = async () => {
    const path = (await takePicture()).path
    await handleSetFile(path)
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 banner__overlay--down"
      {...propsDiv}
    >
      <div className="pb-5">
        <div className="w-full min-h-[72px] h-full flex items-end gap-1 px-2">
          {/* Attach */}
          <PopoverForAndroid
            content={(close) => (
              <div className="flex flex-col gap-2 items-start">
                <button
                  onClick={async () => {
                    close()
                    await handleSelectFiles()
                  }}
                >
                  Chọn ảnh
                </button>
                <button
                  onClick={async () => {
                    close()
                    onOpenFilePicker()
                  }}
                >
                  Chọn file
                </button>
                <button
                  onClick={async () => {
                    close()
                    await handleTakePicture()
                  }}
                >
                  Mở camera / media
                </button>
              </div>
            )}
          >
            <button
              type="button"
              onClick={data !== 'ANDROID' ? onOpenFilePicker : undefined}
              className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
            >
              <Paperclip className="text-white/80" />
            </button>
          </PopoverForAndroid>

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
