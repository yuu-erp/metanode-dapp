import { EditIcon } from 'lucide-react'
import { memo } from 'react'
import { BaseOverlayItem } from './base-overlay-item'
import type { WithMessage } from '../types'
import { useMessageAction } from '@/features/message'

export const EditOverlay = memo(({ data }: WithMessage) => {
  const { setMessageAction } = useMessageAction()

  if (!data.isMine || data.type !== 'text') return null
  return (
    <BaseOverlayItem
      onClick={() =>
        setMessageAction({
          messageId: data.id,
          type: 'EDIT'
        })
      }
      text="Chỉnh sửa"
      icon={<EditIcon />}
    />
  )
})
