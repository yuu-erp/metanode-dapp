import { useEffect } from 'react'
import { useMediaStore, useRtcStore } from '~/stores'

export function useSyncLocalTracksToTransceivers() {
  const transceivers = useRtcStore((s) => s.transceivers)
  const localTracks = useMediaStore((s) => s.localTracks)

  useEffect(() => {
    Object.entries(transceivers).forEach(([source, transceiver]) => {
      if (!transceiver) return
      const track = localTracks[source as keyof typeof localTracks]
      if (!track) return
      const exist = transceiver.sender.track?.id === track.id
      if (!exist) transceiver.sender.replaceTrack(track)
    })
  }, [transceivers, localTracks])

  console.log('localTracks', localTracks.screen)
}
