import { memo } from 'react'
import { MicButton } from './mic-button'
import { VideoButton } from './video-button'
import { CcButton } from './cc-button'
import { ReactionButton } from './reaction-button'
import { UploadButton } from './upload-button'
import { RaiseHandButton } from './raise-hand-button'
import { MoreButton } from './more-button'
import { EndButton } from './end-button'
import { ShareScreenButton } from './share-screen-button'

export const BottomButtons = memo(() => {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-5 flex gap-3 items-center p-3 rounded-full bg-black/30">
      <MicButton />
      <VideoButton />
      <ShareScreenButton />
      <CcButton />
      <ReactionButton />
      <UploadButton />
      <RaiseHandButton />
      <MoreButton />
      <EndButton />
    </div>
  )
})
