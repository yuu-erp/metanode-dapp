import { StreamSource } from '~/@types'
import { useEventLog } from '~/clients'
import {
  createAnswer,
  emitSetAnswer,
  PullTrackData,
  PullTrackWhenNewPersonJoinData
} from '~/services'
import { mediaActions, roomActions } from '~/stores'
import { userActions } from '~/stores/user.store'
import { decodeDataFromBackend, formatAddress, toStreamKey } from '~/utils'
import { useStringAssembler } from './shared'

export function useHandleIncomingOffer() {
  const assemble = useStringAssembler()

  async function handleTrackForNative(
    data: any,
    e: any,
    tracksForNative: any[],
    sdpString: string
  ) {
    // if (!window.fiaiSDK) {
    //   tracksForNative = tracksForNative.filter((_, index) => index % 4 >= 2)
    // }

    const offer: RTCSessionDescriptionInit = JSON.parse(sdpString)
    const sdpAnswer = await createAnswer(offer.sdp!, {
      sourceUser: data.sourceUser,
      eventType: e.eventType,
      sessionId: data.sessionId,
      tracks: tracksForNative
    })
    await emitSetAnswer(sdpAnswer)
  }

  useEventLog(
    'FrontendEvent',
    async (e) => {
      const data: PullTrackData = decodeDataFromBackend(e.data)
      console.log('datadatadata', data)
      const sdpString = assemble(
        data.sessionId + data.sourceUser + e.eventType,
        data.sessionDescription,
        data.index,
        data.total
      )
      if (!sdpString) return
      //handle user

      //handle track
      const grouped: Record<string, string[]> = {}

      const tracksForNative = data.tracks.map(({ track, user }, index) => {
        user = formatAddress(user)
        userActions.addUser(user)

        const source: StreamSource = index % 4 < 2 ? 'user' : 'display'
        console.log('user, source', { user, source })
        const streamKey = toStreamKey(user, source)
        ;(grouped[streamKey] ||= []).push(track.mid)
        mediaActions.setMidToStreamKey(track.mid, streamKey)

        return {
          ...track,
          source,
          streamKey
        }
      })
      console.log('thanhduy - tracksForNative', { tracksForNative, e, data, grouped })
      Object.entries(grouped).forEach(([streamKey, mids]) => {
        mediaActions.setStreamMids(streamKey, mids)
      })

      //xu li backend
      await handleTrackForNative(data, e, tracksForNative, sdpString)
    },
    (e) => {
      console.log('[debuggggg] e', e)
      return roomActions.isEventOwnedByMe(e, e.toUser) && e.eventType === 'PULL_TRACK_WHEN_ME_JOIN'
    }
  )

  useEventLog(
    'FrontendEvent',
    async (e) => {
      const data: PullTrackWhenNewPersonJoinData = decodeDataFromBackend(e.data)
      const user = formatAddress(data.sourceUser)
      const sdpString = assemble(
        data.sessionId + data.sourceUser + e.eventType,
        data.sessionDescription,
        data.index,
        data.total
      )
      if (!sdpString) return

      const grouped: Record<string, string[]> = {}

      const tracksForNative = data.tracks.map((track, index) => {
        userActions.addUser(user)

        const source: StreamSource = index % 4 < 2 ? 'user' : 'display'
        console.log('user, source', { user, source })
        const streamKey = toStreamKey(user, source)
        ;(grouped[streamKey] ||= []).push(track.mid)
        mediaActions.setMidToStreamKey(track.mid, streamKey)

        return {
          ...track,
          source,
          streamKey
        }
      })
      console.log('thanhduy - tracksForNative', { tracksForNative, e, data, grouped })
      Object.entries(grouped).forEach(([streamKey, mids]) => {
        mediaActions.setStreamMids(streamKey, mids)
      })

      //xu li backend
      await handleTrackForNative(data, e, tracksForNative, sdpString)
    },
    (e) => {
      console.log('[debuggggg] e', e)
      return (
        roomActions.isEventOwnedByMe(e, e.toUser) &&
        e.eventType === 'PULL_TRACK_FROM_NEW_PERSON_JOIN'
      )
    }
  )
}
