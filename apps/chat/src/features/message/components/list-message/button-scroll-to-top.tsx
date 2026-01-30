'use client'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

interface ButtonScrollToTopProps extends React.HTMLAttributes<HTMLButtonElement> {}
function ButtonScrollToTop({ ...props }: ButtonScrollToTopProps) {
  return (
    <button
      className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl fixed right-2 bottom-24 z-10"
      style={{
        boxShadow: `2px 2px 6px 0px #0000004D inset`,
        bottom: 'calc(var(--chat-input-height, 96px) + 5px)'
      }}
      {...props}
    >
      <ChevronDown className="size-5" />
    </button>
  )
}

export default React.memo(ButtonScrollToTop)
