import { setAnswerSDP } from '@metanodejs/system-core'
import { onFatal } from '~/clients'
import { rtcStore } from '~/stores'

export async function setAnswer(sdpAnswer: string) {
  if (!window.fiaiSDK) {
    return await setAnswerSDP(sdpAnswer)
  }

  const { pc } = rtcStore.getState()

  if (!pc) onFatal('Invalid pc', 'setAnswer')

  await pc.setRemoteDescription({ type: 'answer', sdp: sdpAnswer })
}
