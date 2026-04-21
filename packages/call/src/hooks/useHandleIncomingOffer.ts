import { formatAddress } from '~/utils'
import { StreamSource } from '~/@types'
import { useEventLog } from '~/clients'
import { createAnswer, emitSetAnswer, PullTrackData } from '~/services'
import { mediaActions, mediaStore, roomActions } from '~/stores'
import { userActions } from '~/stores/user.store'
import { decodeDataFromBackend, toStreamKey } from '~/utils'
import { useStringAssembler } from './shared'

export function useHandleIncomingOffer() {
  const assemble = useStringAssembler()

  useEventLog(
    'FrontendEvent',
    async (e) => {
      const data: PullTrackData = decodeDataFromBackend(e.data)
      const user = formatAddress(data.sourceUser)
      const sdpString = assemble(user, data.sessionDescription, data.index, data.total)
      if (!sdpString) return
      //handle user
      userActions.addUser(user)

      //handle track
      const grouped: Record<string, string[]> = {}
      console.log('thanhduy - incoming offer', {
        tracks: data.tracks,
        now: performance.now()
      })
      const tracksForNative = data.tracks.map((track, index) => {
        const source: StreamSource = index < 2 ? 'user' : 'display'
        const streamKey = toStreamKey(user, source)

        return {
          ...track,
          source,
          streamKey
        }
      })

      Object.entries(grouped).forEach(([streamKey, mids]) => {
        console.log('thanhduy - huhu', { streamKey, mids })
        mediaActions.setStreamMids(streamKey, mids)
      })

      console.log('thanhduy - test ', mediaStore.getState().midToStreamKeys)
      //xu li backend
      const offer: RTCSessionDescriptionInit = JSON.parse(sdpString)
      setTimeout(async () => {
        const sdpAnswer = await createAnswer(offer.sdp!, {
          sourceUser: user,
          eventType: e.eventType,
          sessionId: data.sessionId,
          tracks: tracksForNative
        })
        await emitSetAnswer(sdpAnswer)
      }, 500)
    },
    (e) =>
      roomActions.isEventOwnedByMe(e, e.toUser) &&
      (e.eventType === 'PULL_TRACK_FROM_NEW_PERSON_JOIN' ||
        e.eventType === 'PULL_TRACK_WHEN_ME_JOIN')
  )
}
