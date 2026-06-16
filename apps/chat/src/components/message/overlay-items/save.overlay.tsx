import { DownloadIcon } from 'lucide-react'
import { memo } from 'react'
import { BaseOverlayItem } from './base-overlay-item'
import type { WithMessage } from '../types'
import { handleDownloadFile } from '@/new/file'

export const SaveOverlay = memo(({ data }: WithMessage) => {
  if (!['file', 'voice'].includes(data.type)) return null
  return (
    <BaseOverlayItem
      onClick={() => handleDownloadFile(data)}
      text="Tải xuống"
      icon={<DownloadIcon />}
    />
  )
})
