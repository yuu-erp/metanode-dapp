'use client'
import { ChartPie, Mic, Paperclip } from 'lucide-react'
import * as React from 'react'

function InputChat() {
  return (
    <React.Fragment>
      <div className="fixed bottom-0 left-0 right-0 banner__overlay--down">
        <div className="w-full h-[66px] flex items-start px-3 gap-1.5">
          <button
            className="size-12 bg-black/40 rounded-full flex items-center justify-center"
            style={{
              boxShadow: `2px 2px 6px 0px #0000004D inset`
            }}
          >
            <Paperclip className="text-white/80" />
          </button>
          <div
            className="h-12 flex-1 bg-black/40 rounded-4xl flex items-center px-3"
            style={{
              boxShadow: `2px 2px 6px 0px #0000004D inset`
            }}
          >
            <input
              type="text"
              placeholder="Tin nhắn"
              className="w-full h-full bg-transparent outline-none border-none placeholder:text-white/60"
            />
            <ChartPie className="text-white/80" />
          </div>
          <button
            className="size-12 bg-black/40 rounded-full flex items-center justify-center"
            style={{
              boxShadow: `2px 2px 6px 0px #0000004D inset`
            }}
          >
            <Mic className="text-white/80" />
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(InputChat)
