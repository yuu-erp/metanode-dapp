import { memo } from 'react'

import {
  useAttachLocalTracksToStream,
  useAutoJoinRoom,
  useAutoRejectCall,
  useCallSessionCleanup,
  useHandleCallRejected,
  useHandleIncomingOffer,
  useHandleLeaveRequested,
  useHandleRemoteTracks,
  useRaiseHandEvent,
  useRequesterEvent,
  useScreenShareEvents,
  useSyncLocalTracksToTransceivers
} from '~/hooks'

export const EventLogManager = memo(() => {
  useAutoJoinRoom(true)
  useHandleIncomingOffer()
  useHandleRemoteTracks()
  useSyncLocalTracksToTransceivers()
  useScreenShareEvents()
  useAttachLocalTracksToStream()
  useAutoRejectCall()
  useHandleCallRejected()
  useHandleLeaveRequested()
  useCallSessionCleanup()
  useRaiseHandEvent()
  useRequesterEvent()

  return null
})
