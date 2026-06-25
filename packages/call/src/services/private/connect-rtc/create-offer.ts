import { registerWebRTCIce } from '@metanodejs/system-core'
import { onFatal } from '~/clients'
import { ICE_SERVERS } from '~/configs'
import { callActions, rtcStore } from '~/stores'

function createPeerConnection() {
  return new RTCPeerConnection({
    iceServers: ICE_SERVERS.map((item) => ({ urls: item })),
    bundlePolicy: 'balanced'
  })
}

function initPeerConnection() {
  const pc = createPeerConnection()
  const addTransceiver = (kind: string) => pc.addTransceiver(kind, { direction: 'sendonly' })
  const transceivers = {
    camera: addTransceiver('video'),
    microphone: addTransceiver('audio'),
    screen: addTransceiver('video'),
    systemAudio: addTransceiver('audio')
  }

  rtcStore.setState({ pc, transceivers })
}

async function cleanupPeerConnectionTracks() {
  const { pc } = rtcStore.getState()
  if (!pc) return
  pc.getSenders().forEach((sender) => {
    sender.track?.stop()
  })
  pc.getReceivers().forEach((receiver) => {
    receiver.track?.stop()
  })
}

export async function createOffer() {
  console.log('thanhduy - createOffer 1', window.fiaiSDK)
  if (!window?.fiaiSDK) {
    console.log('thanhduy - createOffer 2')

    const rs = await registerWebRTCIce(ICE_SERVERS)
    console.log('thanhduy - createOffer 3', { rs })

    callActions.initEnable()
    return rs?.sdp ?? rs
  }

  cleanupPeerConnectionTracks()
  initPeerConnection()
  const { pc } = rtcStore.getState()

  if (!pc) onFatal('Invalid pc', 'createOffer')

  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  return offer?.sdp! ?? offer
}
