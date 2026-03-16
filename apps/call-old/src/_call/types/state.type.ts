import type { StoreApi, UseBoundStore } from 'zustand'
import type { RequireCallState } from './require.type'

export type CallState = RequireCallState & {
  loadingStatus: string
  sessionId?: string
  stream?: MediaStream
  pc?: RTCPeerConnection
}

export type CallAction = {
  initialize: (value: RequireCallState) => void
  reset: () => void
}

export type ZustandCallStore = UseBoundStore<StoreApi<CallState & CallAction>>

export type MidTrack = {
  trackName: string
  mid: string
}
