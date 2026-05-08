import { useUiStore } from '@/stores/ui.store'
import { memo } from 'react'
import { useShallow } from 'zustand/shallow'

export type PinnedMessageProps = {}

export const PinnedMessage = memo(({}: PinnedMessageProps) => {
  const { searchOpen, pinOpen } = useUiStore(
    useShallow((s) => ({
      searchOpen: s.searchOpen,
      pinOpen: s.pinOpen
    }))
  )

  if (!pinOpen || searchOpen) return null

  return <div>pin message</div>
})
