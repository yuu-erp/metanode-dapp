import { Download, X } from 'lucide-react'
import { memo } from 'react'
import type { WithMessage } from '../../types'
import { cn } from '@/shared/lib'
import { loadFile, useFileState, useMetadata } from 'file-core'
import { formatFileSize } from '@/new'
import { useCurrentState } from '@/hooks/use-current-state'

export type VoiceDownloaderProps = WithMessage & {
  _fileId: string
}

export const VoiceDownloader = memo(({ data, _fileId }: VoiceDownloaderProps) => {
  const isMine = data.isMine
  const { status, progress = 0, abort } = useFileState(_fileId)
  const { metadata } = useMetadata(_fileId)
  const size = metadata?.size ?? 0
  const { account } = useCurrentState()

  const uploadedSize = formatFileSize(size * (progress / 100))

  const onClick = () => {
    if (status === 'idle') {
      loadFile(_fileId, account?.address ?? '')
    } else {
      abort?.()
    }
  }
  console.log('metadata', { metadata, _fileId })

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-12 h-12 flex items-center justify-center rounded-full shrink-0 relative',
          isMine ? 'bg-blue-500 text-blue-200' : 'bg-blue-200 text-[#3b82f6]'
        )}
        onClick={onClick}
      >
        {status === 'idle' ? <Download /> : <X />}
      </div>

      <div className={cn('flex-1 min-w-0', isMine ? 'text-white' : 'text-black')}>
        <div className="text-sm font-medium truncate">{metadata?.name}</div>
        <div className="text-xs opacity-70">{`${uploadedSize} / ${formatFileSize(size)}`}</div>
      </div>
    </div>
  )
})
