import { mediaActions, mediaStore } from '~/stores'

export function attachTrackToStream(streamKey: string, track: MediaStreamTrack) {
  const { streams } = mediaStore.getState()

  let entity = streams[streamKey]

  // ensure entity + stream tồn tại
  if (!entity) {
    const newStream = new MediaStream()
    mediaActions.setStream(streamKey, newStream)
    entity = mediaStore.getState().streams[streamKey]
  } else if (!entity.stream) {
    const newStream = new MediaStream()
    mediaActions.setStream(streamKey, newStream)
    entity = mediaStore.getState().streams[streamKey]
  }

  const stream = entity!.stream!

  // tránh duplicate track
  const exists = stream.getTracks().some((t) => t.id === track.id)
  if (!exists) {
    stream.getTracks().forEach((t) => {
      if (t.kind === track.kind) stream.removeTrack(t)
    })
    stream.addTrack(track)
  }
}
