import { useReactMessage, useSelectedReaction } from '@/new/message/react-message'
import { cn } from '@/shared/lib'
import { memo } from 'react'

export type ReactionItemProps = {
  reaction: string
  messageId: string
}

export const ReactionItem = memo(({ reaction, messageId }: ReactionItemProps) => {
  const isSelected = useSelectedReaction(reaction, messageId)
  const { mutate } = useReactMessage()

  return (
    <button
      onClick={() =>
        mutate({
          messageId: messageId,
          reaction,
          value: !isSelected
        })
      }
      className={cn(
        'text-2xl transition-transform hover:scale-125 px-1 rounded-sm',
        isSelected && 'bg-white/50'
      )}
    >
      {reaction}
    </button>
  )
})
