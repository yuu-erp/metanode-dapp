import { memo } from 'react'
import { BaseOverlayItem } from './base-overlay-item'
import { CopyIcon } from 'lucide-react'
import type { WithMessage } from '../types'
import { useCopyMessageAction } from '@/features/message'

export const CopyOverlay = memo(({ data }: WithMessage) => {
  const { copyMessage } = useCopyMessageAction()

  if (data.type !== 'text') return null

  return (
    <BaseOverlayItem
      onClick={() => copyMessage(data.content ?? '')}
      text="Sao chép"
      icon={<CopyIcon />}
    />
  )
})
