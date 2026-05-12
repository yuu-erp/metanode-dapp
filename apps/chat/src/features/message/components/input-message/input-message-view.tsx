'use client'
import { usePlatform } from '@/hooks/core/use-platform'
import type { MessageAction } from '@/modules/message'
import { StickerIcon } from '@/shared/components/icons'
import { cn, getMentionHighlightSegments, type Mention } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { Mic, Paperclip, Send } from 'lucide-react'
import * as React from 'react'
import { InputMessageAction } from '.'
import { PopoverForAndroid } from '../popover-for-android'
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
  onRemoveFileData: (index: number) => void

  isStickerDrawerOpen: boolean
  onToggleStickerDrawer: (open: boolean) => void
  setFiles: (files: File[]) => void
  node?: React.ReactNode
  /** Group: truyền danh sách mention để tô sáng @display trong ô nhập */
  mentionHighlights?: Mention[]
  fileData: any[]
  setFileData: (fileData: any[]) => void
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
    node,
    mentionHighlights,
    fileData,
    setFileData,
    onRemoveFileData,
    ...propsDiv
  } = props
  const { data } = usePlatform()

  const [mentionScrollTop, setMentionScrollTop] = React.useState(0)
  const showMentionHighlight = Boolean(mentionHighlights?.length)

  const highlightSegments = React.useMemo(
    () => (showMentionHighlight ? getMentionHighlightSegments(message, mentionHighlights!) : null),
    [message, mentionHighlights, showMentionHighlight]
  )

  React.useEffect(() => {
    if (!showMentionHighlight) setMentionScrollTop(0)
  }, [showMentionHighlight, message])

  const handleSelectImage = async () => {
    setFileData([await sendCommand('select-image', {})])
  }

  const handleTakePicture = async () => {
    setFileData([await sendCommand('take-picture', {})])
  }

  async function handleSelectFile() {
    console.log('select file 1', performance.now())
    const file = await sendCommand('get-file', {})
    console.log('select file 2', performance.now())

    setFileData([file])
  }

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 banner__overlay--down"
      {...propsDiv}
    >
      <div className="pb-5 relative">
        {node}
        <div className="w-full min-h-[72px] h-full flex items-end gap-1 px-2">
          {/* Attach */}
          <PopoverForAndroid
            content={(close) => (
              <div className="flex flex-col gap-2 items-start">
                <button
                  onClick={async () => {
                    close()
                    await handleSelectImage()
                  }}
                >
                  Chọn ảnh
                </button>
                <button
                  onClick={async () => {
                    close()
                    handleSelectFile()
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
              onClick={!data ? onOpenFilePicker : undefined}
              // onClick={onOpenFilePicker}
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
              <SelectedFileList
                fileData={fileData}
                files={files}
                onRemove={onRemoveFile}
                removeFileData={onRemoveFileData}
              />
              <div className="w-full h-full flex items-end">
                <div className="no-scrollbar max-h-60 h-full flex-1 flex items-center overflow-y-auto pl-1">
                  <div className="relative w-full h-full">
                    {showMentionHighlight && highlightSegments ? (
                      <div
                        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-sm"
                        aria-hidden
                      >
                        <div
                          className="w-full min-h-full whitespace-pre-wrap break-words px-0 py-0 text-base leading-normal text-white"
                          style={{ transform: `translateY(-${mentionScrollTop}px)` }}
                        >
                          {highlightSegments.map((seg, i) =>
                            seg.highlight ? (
                              <mark
                                key={i}
                                className="rounded-sm bg-sky-500/45 text-white [box-decoration-break:clone]"
                              >
                                {seg.text}
                              </mark>
                            ) : (
                              <span key={i}>{seg.text}</span>
                            )
                          )}
                        </div>
                      </div>
                    ) : null}
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      placeholder="Tin nhắn"
                      value={message}
                      onChange={(e) => onChangeMessage(e.target.value)}
                      onScroll={
                        showMentionHighlight
                          ? (e) => setMentionScrollTop(e.currentTarget.scrollTop)
                          : undefined
                      }
                      onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          onSend()
                        }
                      }}
                      className={cn(
                        'relative z-10 w-full h-full resize-none bg-transparent outline-none border-none placeholder:text-white/60',
                        showMentionHighlight
                          ? 'text-transparent caret-white selection:bg-sky-500/35'
                          : 'text-white'
                      )}
                    />
                  </div>
                </div>

                <div className="h-8 flex items-center gap-1">
                  <button onClick={() => onToggleStickerDrawer(true)}>
                    <StickerIcon className="text-white/80" />
                  </button>

                  {message.trim() || files.length > 0 || fileData.length > 0 ? (
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
          {!message.trim() && files.length === 0 && fileData.length === 0 && (
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
