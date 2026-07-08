import { memo, useEffect } from 'react'

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
import { enCallAndCloseView } from '~/services'
import { useRoomStore, useUserStore } from '~/stores'

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

  useEffect(() => {
    setTimeout(() => {
      const { users } = useUserStore.getState()
      const room = useRoomStore.getState()
      if (users.length === 1 && !room.isMeeting) {
        enCallAndCloseView()
      }
    }, 1000 * 60)
  }, [])

  return null
})
