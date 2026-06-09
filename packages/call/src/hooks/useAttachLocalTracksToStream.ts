import { useEffect } from 'react'
import { Source, StreamSource } from '~/@types'
import { attachTrackToStream } from '~/services'
import { roomStore, useMediaStore } from '~/stores'
import { toStreamKey } from '~/utils'

function useAttachLocalTrackToStream(source: Source, streamSource: StreamSource) {
  const track = useMediaStore((s) => s.localTracks[source])

  useEffect(() => {
    if (!track) return
    const { address } = roomStore.getState()
    const streamKey = toStreamKey(address, streamSource)

    attachTrackToStream(streamKey, track)
  }, [track])
}

export function useAttachLocalTracksToStream() {
  useAttachLocalTrackToStream('camera', 'user')
  // useAttachLocalTrackToStream('microphone', 'user')
  useAttachLocalTrackToStream('screen', 'display')
  useAttachLocalTrackToStream('systemAudio', 'display')
}
