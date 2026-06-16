import { sendCommand } from '@metanodejs/system-core'
import { onFatal } from '~/clients'
import { ICE_SERVERS } from '~/configs'
import { rtcStore } from '~/stores'

export type CreateAnswerMetadata = {
  sourceUser?: string
  eventType?: string
  sessionId?: string
  tracks?: Array<{
    location?: string
    mid: string
    trackName: string
    streamNumber?: number
    isPublished?: boolean
    roomId?: string
    source?: string
    streamKey?: string
  }>
}

export async function createAnswer(sdpOffer: string, metadata: CreateAnswerMetadata = {}) {
  if (!window.fiaiSDK) {
    return (
      await sendCommand('setOfferSDP', {
        sdp: sdpOffer,
        iceServers: ICE_SERVERS,
        ...metadata
      })
    )?.sdp
  }

  const { pc } = rtcStore.getState()
  if (!pc) onFatal('Invalid pc', 'createAnswer')
  await pc.setRemoteDescription({ type: 'offer', sdp: sdpOffer })
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return answer.sdp!
}
