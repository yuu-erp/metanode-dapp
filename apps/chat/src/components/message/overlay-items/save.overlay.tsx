import { useCurrentAccount } from '@/shared/hooks'
import { useModalStore } from '@/stores/modal.store'
import { downloadFile } from 'file-core'
import { DownloadIcon } from 'lucide-react'
import { memo } from 'react'
import { useShallow } from 'zustand/shallow'
import type { WithMessage } from '../types'
import { BaseOverlayItem } from './base-overlay-item'

export const SaveOverlay = memo(({ data }: WithMessage) => {
  const meta = useModalStore(useShallow((s) => s.meta))
  const { account } = useCurrentAccount()

  if (!['file', 'voice'].includes(data.type) || !meta?.fileId) return null
  return (
    <BaseOverlayItem
      onClick={() => {
        downloadFile(meta.fileId, account?.address ?? '')
      }}
      text="Tải xuống"
      icon={<DownloadIcon />}
    />
  )
})
