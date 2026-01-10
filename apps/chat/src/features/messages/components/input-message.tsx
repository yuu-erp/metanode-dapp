'use client'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { ChartPie, Mic, Paperclip, Send } from 'lucide-react'
import * as React from 'react'
import { useSendMessage } from '../hooks'
import { cn } from '@/shared/lib'

interface InputMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  conversation?: Conversation
  account?: Account
}
const InputMessage = React.forwardRef<HTMLInputElement, InputMessageProps>(
  ({ account, conversation, ...props }, ref) => {
    const [message, setMessage] = React.useState('')
    const { mutate } = useSendMessage()

    const handleSendText = React.useCallback(() => {
      if (!account || !conversation) return
      if (!message.trim()) return

      mutate({
        account,
        conversation,
        payload: {
          type: 'text',
          content: message
        }
      })

      setMessage('')
    }, [account, conversation, message])

    return (
      <React.Fragment>
        <div className="fixed bottom-0 left-0 right-0 banner__overlay--down" {...props}>
          <div className="w-full h-[72px] flex items-start px-3 gap-1.5">
            <button
              className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <Paperclip className="text-white/80" />
            </button>
            <div
              className="h-12 flex-1 bg-black/40 rounded-4xl flex items-center pl-3 backdrop-blur-2xl"
              style={{
                boxShadow: `2px 2px 6px 0px #0000004D inset`
              }}
            >
              <input
                ref={ref}
                type="text"
                placeholder="Tin nhắn"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendText()
                  }
                }}
                className="w-full h-full bg-transparent outline-none border-none placeholder:text-white/60"
              />
              <div className={cn('flex items-center gap-3', message.length ? 'px-1' : 'px-2')}>
                <button>
                  <ChartPie className="text-white/80" />
                </button>
                {message.length ? (
                  <button
                    className="h-10 w-12 bg-blue-500 flex items-center justify-center rounded-full"
                    onClick={handleSendText}
                  >
                    <Send className="text-white/80 size-5" />
                  </button>
                ) : null}
              </div>
            </div>
            {!message.length && (
              <button
                className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl"
                style={{
                  boxShadow: `2px 2px 6px 0px #0000004D inset`
                }}
              >
                <Mic className="text-white/80" />
              </button>
            )}
          </div>
        </div>
      </React.Fragment>
    )
  }
)

export default React.memo(InputMessage)
