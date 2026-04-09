import { setOfferSDP } from '@metanodejs/system-core'
import { onFatal } from '~/clients'
import { ICE_SERVERS } from '~/configs'
import { rtcStore } from '~/stores'

export async function createAnswer(sdpOffer: string) {
  if (!window.finSdk) {
    return await setOfferSDP(sdpOffer, ICE_SERVERS)
  }

  const { pc } = rtcStore.getState()
  if (!pc) onFatal('Invalid pc', 'createAnswer')
  await pc.setRemoteDescription({ type: 'offer', sdp: sdpOffer })
  const answer = await pc.createAnswer()
  await pc.setLocalDescription(answer)
  return answer.sdp!
}
