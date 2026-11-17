import { useEffect } from 'react'
import { attachTrackToStream } from '~/services'
import {
  callStore,
  mediaActions,
  mediaStore,
  shareActions,
  userActions,
  useRtcStore,
} from '~/stores'

export function useHandleRemoteTracks() {
  const pc = useRtcStore((s) => s.pc)
  useEffect(() => {
    if (!pc) return

    const onTrack = (e: RTCTrackEvent) => {
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

        track.onmute = (ev) => {
          console.log('track on mute', { e: ev })
        }
        track.onunmute = (ev) => {
          console.log('track on un mute', { e: ev })
        }

        track.addEventListener('mute', (ev) => {
          console.log('track on mute 2', { e: ev })
        })

        track.addEventListener('ended', (ev) => {
          console.log('track on ended 2', { e: ev })
        })

        track.addEventListener('unmute', (ev) => {
          console.log('track on un mute 2', { e: ev })
        })
        track.onended = () => {
          track.onended = null
          console.log('track on end')
          userActions.removeUser(user)
          shareActions.toggleShareUser(user, false)
          mediaActions.removeUser(user)
        }
      }
      attachTrackToStream(streamKey, track)
    }

    pc.addEventListener('track', onTrack)
    return () => pc.removeEventListener('track', onTrack)
  }, [pc])
}
