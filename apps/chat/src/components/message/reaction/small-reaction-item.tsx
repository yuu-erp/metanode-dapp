import { useSelectedReaction } from '@/new/message/react-message'
import { cn } from '@/shared/lib'
import { memo } from 'react'

export type SmallReactionItemProps = {
  data: ReactionItemData
  messageId: string
}

export const SmallReactionItem = memo(({ data, messageId }: SmallReactionItemProps) => {
  const isSelected = useSelectedReaction(data.reaction, messageId)
  const count = data.reactor.length

  return (
    <div
      key={data.reaction}
      className={cn(
        'flex items-center gap-1 px-2 h-6 rounded-full text-xs border-none transition text-white font-medium',
        isSelected ? 'bg-blue-500' : 'bg-blue-200'
      )}
    >
      <span>{data.reaction}</span>
      {count > 1 && <span>+{count}</span>}
    </div>
  )
})
