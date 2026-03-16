import type { ReqTrack } from '../blockchain/types'
import { createPeerConnection } from './helper'

type JoinState = 'idle' | 'connecting' | 'joined'
export const CALL_DEBUG_EVENT = 'call-debug'

export type CallDebugLog = {
  step: string
  detail?: unknown
  at: string
}

class MeetingCtx {
  private _pc?: RTCPeerConnection
  private _remotePc?: RTCPeerConnection

  tracks: ReqTrack[] = []
  joinState: JoinState = 'idle'
  activeSessionId?: string
  activeRoomId?: string
  publisherSessionId?: string
  subscriberSessionId?: string
  localStream?: MediaStream
  logs: CallDebugLog[] = []
  disconnectCleanupTimer?: number

  get pc(): RTCPeerConnection {
    if (!this._pc) {
      this._pc = createPeerConnection()
    }
    return this._pc
  }

  get remotePc(): RTCPeerConnection {
    if (!this._remotePc) {
      this._remotePc = createPeerConnection()
    }
    return this._remotePc
  }

  isConnectionHealthy() {
    const localState = this._pc?.connectionState
    const fatalStates = ['failed', 'closed']
    const transientStates = ['disconnected']

    // Publisher PC is source of truth for room participation.
    if (fatalStates.includes(localState ?? '')) return false
    if (transientStates.includes(localState ?? '')) return false
    return true
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

    this.localStream?.getTracks().forEach((track) => {
      try {
        track.stop()
      } catch {}
    })

    stopAndClose(this._pc)
    stopAndClose(this._remotePc)

    this._pc = undefined
    this._remotePc = undefined
    this.localStream = undefined
    this.tracks = []
    this.joinState = 'idle'
    this.activeSessionId = undefined
    this.activeRoomId = undefined
    this.publisherSessionId = undefined
    this.subscriberSessionId = undefined
    if (this.disconnectCleanupTimer) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(this.disconnectCleanupTimer)
      }
      this.disconnectCleanupTimer = undefined
    }
    this.pushLog('cleanup_peer_state_done')
  }

  resetRemotePeerState() {
    if (this._remotePc) {
      try {
        this._remotePc.close()
      } catch {}
    }
    this._remotePc = undefined
    this.subscriberSessionId = undefined
    this.pushLog('remote_peer_state_reset_done')
  }

  pushLog(step: string, detail?: unknown) {
    const item: CallDebugLog = {
      step,
      detail,
      at: new Date().toISOString()
    }

    this.logs = [...this.logs.slice(-79), item]
    console.log(`[call-flow] ${step}`, detail ?? '')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<CallDebugLog>(CALL_DEBUG_EVENT, {
          detail: item
        })
      )
    }
  }
}

export const callCtx = new MeetingCtx()
