'use client'
import * as React from 'react'
import clsx from 'clsx'

interface MessageReaction {
  emoji: string
  count: number
  reactedByMe?: boolean
}

interface ReactionMessageProps {
  reactions?: MessageReaction[]
  onClickReaction?: (emoji: string) => void
}

function ReactionMessage({ reactions = [], onClickReaction }: ReactionMessageProps) {
  if (!reactions.length) return null

  return (
    <div className="mt-1 flex gap-1">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          onClick={() => onClickReaction?.(reaction.emoji)}
          className={clsx(
            'flex items-center gap-1 px-2 h-7 rounded-full text-xs border-none transition text-white font-medium',
            reaction.reactedByMe ? 'bg-blue-500' : 'bg-blue-200'
          )}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && <span>+{reaction.count}</span>}
        </button>
      ))}
    </div>
  )
}

export default React.memo(ReactionMessage)
