import { RawTrack } from '~/@types'
import { blockchain, getEventLog, TrackRequest, waitEventLog } from '~/clients'
import { callStore, roomActions, roomStore, rtcStore } from '~/stores'
import { decodeDataFromBackend, encodeDataToBackend, extractMidTrackArray } from '~/utils'
import { createOffer, emitSetAnswer, setAnswer } from '../connect-rtc'
import { JoinAnswerData } from '../../types'

export function rawToTracksInfo(raw: RawTrack[]): TrackRequest[] {
  const { roomId } = roomStore.getState()
  return raw.map((t) => ({
    trackName: t.trackName + Date.now(),
    mid: t.mid,
    streamNumber: 0,
    location: 'local',
    isPublished: true,
    roomId: roomId
  }))
}

export async function joinRoom() {
  console.log('[DEBUG] joinRoom 1', roomStore.getState())

  const { roomId, address } = roomStore.getState()

  const sdpOffer = await createOffer()
  console.log('[DEBUG] joinRoom 2', sdpOffer)

  const rawTracks = extractMidTrackArray(sdpOffer)
  const tracksInfo = rawToTracksInfo(rawTracks)

  const promise = waitEventLog(
    'FrontendEvent',
    (e) => roomActions.isEventOwnedByMe(e, e.toUser) && e.eventType === 'JOIN_ANSWER'
  )
  console.log('[DEBUG] joinRoom 3', { tracksInfo, rawTracks })

  await blockchain.joinRoom({
    _sdpOffer: sdpOffer,
    roomId,
    _initialTracks: tracksInfo,
    owner: address
  })
  console.log('[DEBUG] joinRoom 4')
  const response = await promise

  const { sdp, sessionId }: JoinAnswerData = decodeDataFromBackend(response.data)
  console.log('[DEBUG] joinRoom 4.5', sdp)

  rtcStore.setState({ sessionId })

  await setAnswer(sdp)
  console.log('[DEBUG] joinRoom 5')
  await emitSetAnswer(sdp)
  console.log('[DEBUG] joinRoom 6')
  const addTrackData = {
    Track: tracksInfo
  }

  const _data = encodeDataToBackend(addTrackData)

  await blockchain.emitEventToBackend({
    _eventType: 'ADD_TRACK',
    _roomId: roomId,
    _sessionId: sessionId,
    _data
  })

  callStore.setState({ joined: true })
}
