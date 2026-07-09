'use client'
import { SendButton } from '@/components/chat/send-button'
import { MessageComposer } from '@/components/message/message-composer'
import { SelectFileButton } from '@/components/select-file-button'
import type { MessageAction } from '@/modules/message'
import { StickerIcon } from '@/shared/components/icons'
import { cn, getMentionHighlightSegments, type Mention } from '@/shared/lib'
import { useFileStore } from '@/stores/file.store'
import { setValue, useInputStore } from '@/stores/input.store'
import { modalActions } from '@/stores/modal.store'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { Mic } from 'lucide-react'
import * as React from 'react'
import { SelectedFileList } from './selected-file-list'
import { StickerDrawer } from './sticker-drawer'
import { MentionPopover } from '@/components/mention-popover'
import { useSubmitChatInput } from '@/new/message/submit-chat-input'
import { useChatInputLayout } from './use-chat-input-layout'

export interface InputMessageViewProps extends React.HTMLAttributes<HTMLDivElement> {
  messageAction: MessageAction | null

  /** Group: truyền danh sách mention để tô sáng @display trong ô nhập */
  mentionHighlights?: Mention[]
}

function InputMessageView(props: InputMessageViewProps) {
  const { messageAction, mentionHighlights, ...propsDiv } = props
  const [mentionScrollTop, setMentionScrollTop] = React.useState(0)
  const showMentionHighlight = Boolean(mentionHighlights?.length)
  const fileItems = useFileStore((s) => s.items)
  const value = useInputStore((s) => s.chatValue)
  const micOpen = useUiStore((s) => s.micOpen)
  const { submit } = useSubmitChatInput()
  const { containerRef, textareaRef } = useChatInputLayout(value)

  const highlightSegments = React.useMemo(
    () => (showMentionHighlight ? getMentionHighlightSegments(value, mentionHighlights!) : null),
    [value, mentionHighlights, showMentionHighlight]
  )

  React.useEffect(() => {
    if (!showMentionHighlight) setMentionScrollTop(0)
  }, [showMentionHighlight, value])

  function reforcus() {
    const el = textareaRef.current
    if (!el) return
    el.focus()
  }

  return (
    <>
      {!micOpen && (
        <>
          <div ref={containerRef} className="absolute bottom-0 left-0 right-0" {...propsDiv}>
            <div className="pb-5 relative">
              <MentionPopover />
              <div className="w-full min-h-[72px] h-full flex items-end gap-1 px-2">
                {/* Attach */}
                <SelectFileButton />

                {/* Input */}
                <div className="relative flex-1 rounded-4xl overflow-hidden">
                  {/* BLUR LAYER – KHÔNG SCROLL */}
                  <div
                    className="absolute inset-0 backdrop-blur-2xl pointer-events-none basic"
                    aria-hidden
                  />

                  {/* CONTENT LAYER – SCROLL Ở ĐÂY */}
                  <div
                    className={cn(
                      'relative h-full pb-2 flex flex-col gap-1',
                      !value.trim() ? 'px-2' : 'px-1',
                      fileItems.length > 0 ? 'pt-0' : 'pt-2'
                    )}
                  >
                    <MessageComposer />
                    <SelectedFileList />
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
                            value={value}
                            onChange={(e) => setValue(e, 'chatValue')}
                            onScroll={
                              showMentionHighlight
                                ? (e) => setMentionScrollTop(e.currentTarget.scrollTop)
                                : undefined
                            }
                            onKeyDown={(e) => {
                              if (e.nativeEvent.isComposing) return
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                submit()
                              }
                            }}
                            className={cn(
                              'relative z-10 w-full h-full resize-none bg-transparent outline-none border-none placeholder:text-black/50',
                              showMentionHighlight
                                ? 'text-transparent caret-white selection:bg-sky-500/35'
                                : ''
                            )}
                          />
                        </div>
                      </div>

                      <div className="h-8 flex items-center gap-1">
                        <button onClick={() => modalActions.setOpen('sticker')}>
                          <StickerIcon className="text-black/80" />
                        </button>
                        <SendButton reforcus={reforcus} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mic */}
                {!value.trim() && fileItems.length === 0 && (
                  <button
                    className="size-12 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80 btn"
                    onClick={() => uiActions.setMicOpen(true)}
                  >
                    <Mic className="" />
                  </button>
                )}
              </div>
            </div>
            <StickerDrawer />
          </div>
        </>
      )}
    </>
  )
}

export default React.memo(InputMessageView)
