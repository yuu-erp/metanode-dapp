import type { Emitter } from 'mitt'
import type { AppEvent, EventBus, MidTrack, RtcAnswerReceived, ZustandCallStore } from './types'
import { RtcState } from './rtc-state'
import { registerWebRTCIce, setAnswerSDP } from '@metanodejs/system-core'
import type { Blockchain } from './blockchain'
import { encodeDataToBackend } from './shared'

export class CallService {
  constructor(
    private readonly store: ZustandCallStore,
    private readonly eventBus: EventBus,
    private readonly blockchain: Blockchain
  ) {
    eventBus.on('rtc:answer:received', this.connectLocal)
  }
  rtcState?: RtcState

  async emitEventToBackend(_eventType: string, data: any) {
    const { roomId, hiddenAddress, sessionId } = this.store.getState()
    await this.blockchain.meeting.emitEventToBackend({
      from: hiddenAddress,
      inputData: {
        _eventType,
        _roomId: roomId!,
        _sessionId: sessionId!,
        _data: encodeDataToBackend(data)
      }
    })
  }

  async emitSdpAnswerToBackend(sdpAnswer: string) {
    const { address } = this.store.getState()
    const sdpAnswerData = {
      ToUser: address,
      AnswerSDP: sdpAnswer
    }
    await this.emitEventToBackend('SDP_ANSWER', sdpAnswerData)
  }

  private extractMidTrackArray(sdp: string): MidTrack[] {
    const sections = sdp.split('\nm=') // tách theo từng media section
    const result: { mid: string; trackName: string }[] = []

    sections.forEach((section) => {
      const midMatch = section.match(/a=mid:(\S+)/)
      const msidMatch = section.match(/a=msid:[^\s]+\s+([^\s]+)/)

      if (midMatch) {
        result.push({
          mid: midMatch[1],
          trackName: msidMatch ? msidMatch[1] : '' // nếu không có msid thì để rỗng
        })
      }
    })

    return result
  }

  private toReqTracks(midTracks: MidTrack[], roomId: string): ReqTrack[] {
    const validTracks = midTracks.filter((t) => Boolean(t.trackName))
    return validTracks.map((t, i) => ({
      trackName: t.trackName,
      mid: t.mid,
      streamNumber: i, //must be number
      location: 'local',
      isPublished: true,
      roomId: roomId
    }))
  }

  private setLoadingMessage(message: string) {
    this.store.setState({ loadingStatus: message })
  }

  private async createOffer() {
    if (window.finSdk) {
      this.rtcState = new RtcState()
      this.store.setState({ pc: this.rtcState.pc })
      return await this.rtcState.createOffer()
    }
    return await registerWebRTCIce(RtcState.ICE_SERVERS)
  }

  async joinRoom() {
    const { roomId = '', hiddenAddress } = this.store.getState()
    this.setLoadingMessage('start join room...')
    const sdpOffer = await this.createOffer()
    const midTracks = this.extractMidTrackArray(sdpOffer)
    const tracks = this.toReqTracks(midTracks, roomId)
    await this.blockchain.meeting.joinRoom({
      from: hiddenAddress,
      inputData: {
        _sdpOffer: sdpOffer,
        roomId,
        _initialTracks: tracks
      }
    })
    this.setLoadingMessage('finish join room...')
  }

  async connectLocal(e: RtcAnswerReceived) {
    const { pc, localTracks, roomId, hiddenAddress } = this.store.getState()
    this.store.setState({ loadingStatus: 'Start connect local...' })

    if (window.finSdk) {
      let localPc = pc
      if (!localPc) {
        this.rtcState = new RtcState()
        localPc = this.rtcState.pc
      }
      await this.rtcState?.setAnswer(e.sdp)
    } else {
      await setAnswerSDP(e.sdp)
    }
  }
}
