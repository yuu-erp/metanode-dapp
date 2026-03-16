import { memo } from 'react'
import { EndCallButton } from './end-call-button'
import { MicButton } from './mic-button'
import { CameraButton } from './camera-button'

export const FeatureButtons = memo(() => {
  return (
    <div className="flex flex-row items-center gap-3 absolute left-1/2 -translate-x-1/2 bottom-5">
      <EndCallButton />
      <MicButton />
      <CameraButton />
    </div>
  )
})
