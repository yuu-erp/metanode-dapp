import { useEffect } from 'react'
import { attachTrackToStream } from '~/services'
import {
  callStore,
  mediaActions,
  mediaStore,
  shareActions,
  userActions,
  useRtcStore
} from '~/stores'

export function useHandleRemoteTracks() {
  const pc = useRtcStore((s) => s.pc)
  useEffect(() => {
    if (!pc) return
    pc.ontrack = (e) => {
      const mid = e.transceiver.mid
      const track = e.track
      if (!mid) return

      const { trackPulled } = callStore.getState()
      const { midToStreamKeys } = mediaStore.getState()
      if (!trackPulled) {
        callStore.setState({ trackPulled: true })
      }

      const streamKey = midToStreamKeys[mid]

      if (!streamKey) return
      if (streamKey.endsWith('user')) {
        const user = streamKey.split('_')[0]

        track.onended = () => {
          track.onended = null
          userActions.removeUser(user)
          shareActions.toggleShareUser(user, false)
          mediaActions.removeUser(user)
        }
      }
      console.log('thanhduy - tracktracktracktrack', track)
      attachTrackToStream(streamKey, track)
    }

    return () => {
      pc.ontrack = null
    }
  }, [pc])
}
