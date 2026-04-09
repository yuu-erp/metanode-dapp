import { sendReaction } from '@app/call'
import { Laugh } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { Button } from '../ui'

export type ReactionButtonProps = {}

const quickReactions = ['❤️', '😢', '😂', '👍', '👎', '🔥', '🥰']

export const ReactionButton = memo(({}: ReactionButtonProps) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // đóng popover khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <Button
        onClick={() => setOpen((prev) => !prev)}
        size="icon"
        variant={open ? 'active' : 'default'}
      >
        <Laugh />
      </Button>

      {open && (
        <div
          className="
            absolute bottom-16 left-1/2 -translate-x-1/2
            bg-card-foreground backdrop-blur
            rounded-full px-3 py-2
            flex gap-5 shadow-lg
            animate-in fade-in zoom-in-95
          "
        >
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sendReaction(emoji)
              }}
              className="
                text-2xl hover:scale-125 transition
                active:scale-95
              "
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
