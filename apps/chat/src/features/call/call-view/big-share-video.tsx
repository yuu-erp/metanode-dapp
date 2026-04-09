import { useActiveShareStreamKey, useShareStore } from '@app/call'
import { memo } from 'react'
import { ParticipantView } from './participant-view'
import { cn } from '@/shared/lib'

export const BigShareVideo = memo(() => {
  const streamKey = useActiveShareStreamKey()
  const activeShareUser = useShareStore((s) => s.activeShareUser)

  if (!activeShareUser) return
  return (
    <>
      <ParticipantView className={cn('h-[50dvh] md:h-auto md:w-[50dvw]')} streamKey={streamKey} />
    </>
  )
})
