import { eventBus } from '../event-bus'
import { createPeerConnection } from './helper'

export type CallContextState = {
  caller: string
  callee: string
  isMeet: boolean
  isCaller: boolean
  address: string
  roomId: string
  sessionId: string
  localSessionId: string
  remoteSessionId: string
  localTracks: ReqTrack[]
  joinState: JoinState
  hiddenAddress: string
}

export type JoinState = 'idle' | 'connecting' | 'joined'

class CallContext implements CallContextState {
  caller = ''
  callee = ''
  isMeet = false
  isCaller = false
  address = ''
  roomId = ''
  sessionId = ''
  localSessionId: string = ''
  remoteSessionId: string = ''
  localTracks: ReqTrack[] = []
  joinState: JoinState = 'idle'
  private _localPc?: RTCPeerConnection
  private _remotePc?: RTCPeerConnection
  hiddenAddress = ''

  get localPc() {
    if (!this._localPc) this._localPc = createPeerConnection()
    return this._localPc
  }

  get remotePc() {
    if (!this._remotePc) this._remotePc = createPeerConnection()
    return this._remotePc
  }

  getState = () => {
    return {
      caller: this.caller,
      callee: this.callee,
      isMeet: this.isMeet,
      isCaller: this.isCaller,
      address: this.address,
      roomId: this.roomId,
      sessionId: this.sessionId,
      localSessionId: this.localSessionId,
      remoteSessionId: this.remoteSessionId
    }
  }

  setState(value: Partial<CallContextState>) {
    Object.assign(this, value)
    eventBus.emit('context.update', this.getState())
  }

  cleanupPeerState() {
    const stopAndClose = (pc?: RTCPeerConnection) => {
      if (!pc) return

      pc.getSenders().forEach((sender) => {
        try {
          sender.track?.stop()
        } catch {}
      })

      pc.getReceivers().forEach((receiver) => {
        try {
          receiver.track?.stop()
        } catch {}
      })

      try {
        pc.close()
      } catch {}
    }

    stopAndClose(this._localPc)
    stopAndClose(this._remotePc)

    this._localPc = undefined
    this._remotePc = undefined
    this.localTracks = []
    // this.joinState = 'idle'
    this.localSessionId = ''
    this.roomId = ''
  }
}

export const callContext = new CallContext()
export * from './helper'
