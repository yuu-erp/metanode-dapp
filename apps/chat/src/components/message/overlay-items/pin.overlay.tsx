import { PinIcon, PinOffIcon } from 'lucide-react'
import { memo } from 'react'
import type { WithMessage } from '../types'
import { BaseOverlayItem } from './base-overlay-item'
import { useCurrentState } from '@/hooks/use-current-state'
import { pinMessage, setPinnedMessageState, useIsPinned } from '@/new/message'

export type PinOverlayProps = {}

export const PinOverlay = memo(({ data }: WithMessage) => {
  const { base } = useCurrentState()
  const { isPinned } = useIsPinned(data.id)

  if (data.type === 'call_status') return null
  return (
    <BaseOverlayItem
      onClick={() => {
        const v = !isPinned
        setPinnedMessageState(base, data.id, v)
        pinMessage(v, data.id, base)
      }}
      text={isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
      icon={
        isPinned ? (
          <PinOffIcon className="size-5 text-black" />
        ) : (
          <PinIcon className="size-5 text-black" />
        )
      }
    />
  )
})
