import { blockchain, onFatal } from '~/clients'
import { roomStore, rtcStore } from '~/stores'
import { encodeDataToBackend } from '~/utils'

export async function emitSetAnswer(sdpAnser: string) {
  const { address, roomId } = roomStore.getState()
  const { sessionId } = rtcStore.getState()
  if (!sessionId) onFatal('Invalid session Id', 'EmitSetAnswer')

  const data = {
    ToUser: address,
    AnswerSDP: sdpAnser
  }

  const _data = encodeDataToBackend(data)

  await blockchain.emitEventToBackend({
    _eventType: 'SDP_ANSWER',
    _roomId: roomId!,
    _sessionId: sessionId,
    _data
  })
}
