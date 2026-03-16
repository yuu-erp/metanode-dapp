export class RtcState {
  constructor() {}
  pc = this.createPeerConnection()
  static ICE_SERVERS = ['stun:stun.cloudflare.com:3478']

  createPeerConnection() {
    return new RTCPeerConnection({
      iceServers: RtcState.ICE_SERVERS.map((item) => ({ urls: item })),
      bundlePolicy: 'balanced'
    })
  }

  async setupLocalMedia() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const hasVideoInput = devices.some((device) => device.kind === 'videoinput')
    let stream: MediaStream | undefined

    if (hasVideoInput) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        })
      } catch (error) {
        const errorName = (error as DOMException)?.name
        if (
          errorName === 'NotFoundError' ||
          errorName === 'OverconstrainedError' ||
          errorName === 'NotAllowedError'
        ) {
          console.warn('Local media unavailable, continue in receive-only mode', error)
        } else {
          throw error
        }
      }
    } else {
      console.warn('No video input device found, continue in receive-only mode')
    }

    if (stream) {
      console.log('thanhduy - joinRoom 3')

      for (const track of stream.getTracks()) {
        this.pc.addTrack(track, stream)
      }
    } else {
      // Keep the PC negotiable even without local camera/mic.
      this.pc.addTransceiver('video', { direction: 'recvonly' })
    }
    return stream
  }

  async createOffer() {
    this.setupLocalMedia()
    const offer = await this.pc.createOffer()
    await this.pc.setLocalDescription(offer)
    return offer.sdp!
  }

  async setAnswer(sdpAnswer: string) {
    await this.pc.setRemoteDescription({ type: 'answer', sdp: sdpAnswer })
  }

  async createAnswer(sdpOffer: string) {
    await this.pc.setRemoteDescription({ type: 'offer', sdp: sdpOffer })
    const answer = await this.pc.createAnswer()
    await this.pc.setLocalDescription(answer)
    return answer.sdp!
  }

  cleanup() {
    this.pc.getSenders().forEach((sender) => {
      try {
        sender.track?.stop()
      } catch {}
    })

    this.pc.getReceivers().forEach((receiver) => {
      try {
        receiver.track?.stop()
      } catch {}
    })

    try {
      this.pc.close()
    } catch {}
  }
}
