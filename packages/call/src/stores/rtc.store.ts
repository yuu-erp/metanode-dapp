import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Source } from '~/@types'

export type RtcState = {
  pc: RTCPeerConnection | null
  transceivers: Record<Source, RTCRtpTransceiver | null>
  sessionId: string | null
}

export type RtcActions = {
  reset: () => void
}

export type RtcStore = RtcState & RtcActions

export const rtcStore = create<RtcStore>()(
  immer((set) => ({
    pc: null,
    transceivers: {
      camera: null,
      microphone: null,
      screen: null,
      systemAudio: null
    },
    sessionId: null,
    reset: () => {
      set((s) => {
        // 1. Stop & clear transceivers
        Object.values(s.transceivers).forEach((t) => {
          try {
            t?.stop?.()
          } catch {}
        })

        // 2. Close peer connection
        try {
          s.pc?.close?.()
        } catch {}

        // 3. Reset state
        s.pc = null
        s.transceivers = {
          camera: null,
          microphone: null,
          screen: null,
          systemAudio: null
        }
        s.sessionId = null
      })
    }
  }))
)

export const useRtcStore = rtcStore

export const rtcActions = rtcStore.getState() as RtcActions
