'use client'
import { PinIcon } from 'lucide-react'
import * as React from 'react'

function PinMessages() {
  return (
    <div
      className="h-14 flex items-center py-2 gap-3 sticky w-full z-10 px-3 bg-white/40 text-black shadow border-app"
      style={{
        top: 'var(--header-height)'
      }}
    >
      <span className="h-full w-[3px] rounded-md bg-black"></span>
      <div className="h-full flex-1 flex items-center">
        <div>
          <div className="text-base font-bold flex-1 line-clamp-1 break-all">Pinned Message</div>
          <div className="flex-1 text-sm font-medium break-all text-black/60 line-clamp-1">
            We sent an AI agent to read the entire internet. Every release, every hot take, and
            every unreadable blog post from the past week. It's now standing by to build a
            presidential brief just for you. It barely survived. You (hopefully) will.
          </div>
        </div>
        <PinIcon className="shrink-0 size-5" />
      </div>
    </div>
  )
}

export default React.memo(PinMessages)
