import { formatAddress } from '~/utils'
import { StreamSource } from '~/@types'
import { useEventLog } from '~/clients'
import { createAnswer, emitSetAnswer, PullTrackData } from '~/services'
import { mediaActions, roomActions } from '~/stores'
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
      console.log('thanhduy - incoming offer', data.tracks)
      data.tracks.forEach((t, i) => {
        const source: StreamSource = i < 2 ? 'user' : 'display'
        const streamKey = toStreamKey(user, source)

        ;(grouped[streamKey] ||= []).push(t.mid)
        console.log('thanhduy - setMidToStreamKey', { mid: t.mid, streamKey })
        mediaActions.setMidToStreamKey(t.mid, streamKey)
      })

      Object.entries(grouped).forEach(([streamKey, mids]) => {
        mediaActions.setStreamMids(streamKey, mids)
      })
      //xu li backend
      console.log('thanhduy - sdpString', sdpString)
      const offer: RTCSessionDescriptionInit = JSON.parse(sdpString)
      const sdpAnswer = await createAnswer(offer.sdp!)
      await emitSetAnswer(sdpAnswer)
    },
    (e) =>
      roomActions.isEventOwnedByMe(e, e.toUser) &&
      (e.eventType === 'PULL_TRACK_FROM_NEW_PERSON_JOIN' ||
        e.eventType === 'PULL_TRACK_WHEN_ME_JOIN')
  )
}
