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
  console.log('thanhduy - joinRoom 1')
  const { roomId, address } = roomStore.getState()

  const sdpOffer = await createOffer()
  console.log('thanhduy - joinRoom 2')

  const rawTracks = extractMidTrackArray(sdpOffer)
  const tracksInfo = rawToTracksInfo(rawTracks)
  getEventLog().on('FrontendEvent', (e) => {
    console.log('FrontendEvent', { e })
  })
  const promise = waitEventLog(
    'FrontendEvent',
    (e) => roomActions.isEventOwnedByMe(e, e.toUser) && e.eventType === 'JOIN_ANSWER'
  )
  console.log('thanhduy - joinRoom 3')

  await blockchain.joinRoom({
    _sdpOffer: sdpOffer,
    roomId,
    _initialTracks: tracksInfo,
    owner: address
  })
  console.log('thanhduy - joinRoom 4')
  const response = await promise
  console.log('thanhduy - joinRoom 4.1', response)

  const { sdp, sessionId }: JoinAnswerData = decodeDataFromBackend(response.data)

  rtcStore.setState({ sessionId })

  await setAnswer(sdp)
  console.log('thanhduy - joinRoom 5')

  await emitSetAnswer(sdp)
  console.log('thanhduy - joinRoom 6')

  const addTrackData = {
    Track: tracksInfo
  }

  const _data = encodeDataToBackend(addTrackData)
  console.log('thanhduy - joinRoom 7')

  await blockchain.emitEventToBackend({
    _eventType: 'ADD_TRACK',
    _roomId: roomId,
    _sessionId: sessionId,
    _data
  })
  console.log('thanhduy - joinRoom 8')

  callStore.setState({ joined: true })
}
