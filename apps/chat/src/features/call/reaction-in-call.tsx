import { useCallReactions } from '@app/call'
import { memo } from 'react'

type ReactionItem = {
  id: number
  emoji: string
  left: number
  name: string
}

export const ReactionInCall = memo(() => {
  const reactions = useCallReactions()

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {reactions.map((item) => (
        <FloatingEmoji key={item.id} {...item} />
      ))}
    </div>
  )
})

const FloatingEmoji = memo(({ emoji, left, name }: ReactionItem) => {
  return (
    <div
      className="absolute bottom-0 text-3xl animate-float"
      style={{
        left: `${left}%`
      }}
    >
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm">{name}</p>
        {emoji}
      </div>
    </div>
  )
})
