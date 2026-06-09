import { ForwardIcon } from 'lucide-react'
import { memo } from 'react'
import { BaseOverlayItem } from './base-overlay-item'
import { useMessageAction } from '@/features/message'
import type { WithMessage } from '../types'

export const ForwardOverlay = memo(({ data }: WithMessage) => {
  const { setMessageAction } = useMessageAction()

  if (data.type === 'call_status') return null
  return (
    <BaseOverlayItem
      onClick={() =>
        setMessageAction({
          messageId: data.id,
          type: 'FORWARD'
        })
      }
      text="Chuyển tiếp"
      icon={<ForwardIcon />}
    />
  )
})
