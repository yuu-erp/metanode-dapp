'use client'
import * as React from 'react'

interface ReactionMessageProps {
  reactions?: string[]
}
function ReactionMessage({ reactions = [] }: ReactionMessageProps) {
  if (!reactions.length) return null
  return (
    <React.Fragment>
      <div className="h-6 px-1 bg-blue-500 rounded-full flex items-center justify-center text-sm">
        <div className="flex -space-x-2.5">
          {reactions.map((reaction, idx) => (
            <span key={idx}>{reaction}</span>
          ))}
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(ReactionMessage)
