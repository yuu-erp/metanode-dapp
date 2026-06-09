import { memo } from 'react'
import { BaseOverlayItem } from './base-overlay-item'
import { ReplyIcon } from 'lucide-react'
import { useMessageAction } from '@/features/message'
import type { WithMessage } from '../types'

export const ReplyOverlay = memo(({ data }: WithMessage) => {
  const { setMessageAction } = useMessageAction()

  return (
    <BaseOverlayItem
      hasSeparator={false}
      onClick={() =>
        setMessageAction({
          type: 'REPLY',
          messageId: data.id
        })
      }
      text="Trả lời"
      icon={<ReplyIcon />}
    />
  )
})
