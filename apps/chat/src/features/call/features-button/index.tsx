import { useCallStore, useRoomStore } from '@app/call'
import { memo } from 'react'
import { CameraButton } from './camera-button'
import { EndCallButton } from './end-call-button'
import { MicButton } from './mic-button'
import { RaiseHandButton } from './raise-hand-button'
import { ReactionButton } from './reaction-button'
import { useShallow } from 'zustand/shallow'
import { ShareScreenButton } from './share-screen-button'

export const FeatureButtons = memo(() => {
  const { trackPulled, joined } = useCallStore()
  const { isCaller, isMeet } = useRoomStore(
    useShallow((s) => ({
      isCaller: s.isCaller,
      isMeet: s.isMeet
    }))
  )

  if (!joined) return null
  return (
    <div className="flex flex-row items-center gap-3 absolute left-1/2 -translate-x-1/2 bottom-5">
      <EndCallButton />
      <MicButton />
      <CameraButton />

      {(isCaller || trackPulled) && (
        <>
          <ShareScreenButton />
          {isMeet && (
            <>
              <ReactionButton />
              <RaiseHandButton />
            </>
          )}
        </>
      )}
    </div>
  )
})
