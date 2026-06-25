import { useDeleteMessage } from '@/features/message'
import { TrashIcon } from 'lucide-react'
import { memo } from 'react'
import type { WithMessage } from '../types'
import { BaseOverlayItem } from './base-overlay-item'

export const DeleteOverlay = memo(({ data }: WithMessage) => {
  const { mutate } = useDeleteMessage()

  if (!data.isMine) return null
  return (
    <BaseOverlayItem
      onClick={() => {
        mutate(data)
      }}
      className="text-red-500"
      text="Xoá tin nhắn"
      icon={<TrashIcon />}
    />
  )
})
