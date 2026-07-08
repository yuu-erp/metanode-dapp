import { memo } from 'react'
import type { WithMessage } from '../../types'
import { AudioPlayer } from './AudioPlayer'
import { useCache } from 'file-core'
import { VoiceDownloader } from './VoiceDownloader'

export type VoiceContentProps = WithMessage

export const VoiceContent = memo(({ data }: VoiceContentProps) => {
  const fileId = data.fileIds?.[0]
  const { cache } = useCache(fileId)
  if (!fileId) return null
  return (
    <>
      {!!cache && <AudioPlayer id={fileId} />}
      {!cache && <VoiceDownloader data={data} _fileId={fileId} />}
    </>
  )
})
