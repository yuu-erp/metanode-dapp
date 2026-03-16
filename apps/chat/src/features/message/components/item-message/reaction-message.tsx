'use client'
import type { MessageReaction } from '@/modules/message'
import { useIsMineReaction } from '@/shared/hooks'
import clsx from 'clsx'
import * as React from 'react'

interface ReactionMessageProps {
  reactions?: MessageReaction[]
  onClickReaction?: (emoji: string) => void
}

function ReactionMessage({ reactions = [], onClickReaction }: ReactionMessageProps) {
  const isMine = useIsMineReaction()

  if (!reactions.length) return null
  return (
    <div className="mt-1 flex gap-1">
      {reactions.map((reaction) => {
        const count = reaction.users.length

        return (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onClickReaction?.(reaction.emoji)}
            className={clsx(
              'flex items-center gap-1 px-2 h-6 rounded-full text-xs border-none transition text-white font-medium',
              isMine(reaction) ? 'bg-blue-500' : 'bg-blue-200'
            )}
          >
            <span>{reaction.emoji}</span>
            {count > 1 && <span>+{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default React.memo(ReactionMessage)
