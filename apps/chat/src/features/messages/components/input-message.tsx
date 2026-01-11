'use client'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { StickerIcon } from '@/shared/components/icons'
import { Mic, Paperclip, Send } from 'lucide-react'
import * as React from 'react'
import { useSendMessage } from '../hooks'

interface InputMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  conversation?: Conversation
  account?: Account
}

const InputMessage = React.forwardRef<HTMLTextAreaElement, InputMessageProps>(
  ({ account, conversation, ...props }, ref) => {
    const [message, setMessage] = React.useState('')
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const containerRef = React.useRef<HTMLDivElement | null>(null)

    const { mutate, isPending } = useSendMessage()

    // merge ref
    React.useImperativeHandle(ref, () => textareaRef.current!)

    // auto resize textarea
    React.useEffect(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [message])

    React.useEffect(() => {
      const el = containerRef.current
      if (!el) return

      const updateHeight = () => {
        document.documentElement.style.setProperty('--chat-input-height', `${el.offsetHeight}px`)
      }

      updateHeight()

      const observer = new ResizeObserver(updateHeight)
      observer.observe(el)

      return () => observer.disconnect()
    }, [])

    const handleSendText = React.useCallback(() => {
      if (!account || !conversation) return

      const content = message.trim()
      if (!content || isPending) return

      mutate({
        account,
        conversation,
        payload: {
          type: 'text',
          content
        }
      })

      setMessage('')
    }, [account, conversation, message, isPending, mutate])

    return (
      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 right-0 banner__overlay--down"
        {...props}
      >
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
          <div className="w-full min-h-[72px] h-full flex items-end px-2 gap-1.5">
            {/* Attach */}
            <button className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl">
              <Paperclip className="text-white/80" />
            </button>

            {/* Input */}
            {/* Input */}
            <div className="relative flex-1 rounded-4xl overflow-hidden">
              {/* BLUR LAYER – KHÔNG SCROLL */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-2xl pointer-events-none"
                aria-hidden
              />

              {/* CONTENT LAYER – SCROLL Ở ĐÂY */}
              <div className="relative h-full py-2 px-1 flex items-end">
                <div className="no-scrollbar min-h-8 max-h-60 h-full flex-1 flex items-center overflow-y-auto pl-1">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Tin nhắn"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendText()
                      }
                    }}
                    className="w-full h-full resize-none bg-transparent outline-none border-none placeholder:text-white/60 text-white"
                  />
                </div>

                <div className="h-8 flex items-center gap-1">
                  <button>
                    <StickerIcon className="text-white/80" />
                  </button>

                  {message.trim() && (
                    <button
                      disabled={isPending}
                      onClick={handleSendText}
                      className="h-10 w-12 bg-blue-500 rounded-full flex items-center justify-center disabled:opacity-50"
                    >
                      <Send className="text-white size-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Mic */}
            {!message.trim() && (
              <button className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl">
                <Mic className="text-white/80" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

export default React.memo(InputMessage)
