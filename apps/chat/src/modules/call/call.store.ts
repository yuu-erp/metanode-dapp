import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { ReqTrack } from './types'

export type MediaState = {
  allow: boolean
  on: boolean
  exist: boolean
  popup: boolean
}

const defaultMediaState: MediaState = {
  allow: false,
  on: false,
  exist: false,
  popup: false
}

export type CallState = {
  caller: string
  callee: string
  isMeet: boolean
  isCaller: boolean
  address: string
  roomId: string
  sessionId: string
  hiddenAddress: string
  localPc?: RTCPeerConnection
  localStream?: MediaStream
  video: MediaState
  audio: MediaState
  message: string
  joinLoading: boolean
  localTracks: ReqTrack[]
  connected: boolean
  cleanupFunctions: Function[]
  reloadPopup: boolean
}

export type MediaKind = 'video' | 'audio'

export type CallActions = {
  cleanup: () => void
  updateMedia: (kind: MediaKind, value: Partial<MediaState>) => void
  setMessage: (value: string) => void
  cleanupMedia: () => void
  getExistMedia: () => Promise<void>
  addCleanupFunction: (fn: Function) => void
  toggleMedia: (kind: MediaKind) => void
  updateMediaPermissionState: (kind: MediaKind) => void
}

export type CallStore = CallState & CallActions

const defaultState: CallState = {
  reloadPopup: false,
  caller: '',
  callee: '',
  isMeet: false,
  isCaller: false,
  address: '',
  roomId: '',
  sessionId: '',
  hiddenAddress: '',
  video: { ...defaultMediaState },
  audio: { ...defaultMediaState },
  message: 'Loading...',
  joinLoading: false,
  localTracks: [],
  connected: false,
  cleanupFunctions: []
}

export const callStore = create<CallStore>()(
  immer((set, get) => ({
    ...defaultState,
    cleanup: () => {
      get().cleanupMedia()
      set({ ...defaultState })
    },
    updateMedia: (kind, value) => {
      set((s) => {
        Object.assign(s[kind], value)
      })
    },
    setMessage: (message) => set({ message }),
    toggleMedia: (kind) => {
      const state = get()
      const { updateMedia, localStream } = state

      const media = state[kind]

      if (!media.allow) return updateMedia(kind, { popup: true })
      if (!localStream) return
      const newValue = !media.on
      const tracks = kind === 'video' ? localStream.getVideoTracks() : localStream.getAudioTracks()
      tracks.forEach((track) => {
        track.enabled = newValue
      })
      updateMedia(kind, { on: newValue })
    },

    cleanupMedia: () => {
      const { localPc, localStream, cleanupFunctions } = get()

      cleanupFunctions.forEach((fn) => fn())

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }

      if (localPc) {
        localPc.close()
      }
      set({ localPc: undefined, localStream: undefined, cleanupFunctions: [] })
    },
    getExistMedia: async () => {
      const { updateMedia } = get()
      const devices = await navigator.mediaDevices.enumerateDevices()
      updateMedia('video', { exist: devices.some((d) => d.kind === 'videoinput') })
      updateMedia('audio', { exist: devices.some((d) => d.kind === 'audioinput') })
    },
    updateMediaPermissionState: async (kind) => {
      const allow = await navigator.permissions
        .query({ name: kind === 'video' ? 'camera' : 'microphone' })
        .then((r) => {
          r.onchange = () => {
            if (r.state === 'granted') window.location.reload()
          }
          return r.state !== 'denied'
        })
        .catch(() => false)
      const newValue: any = { allow }
      if (!allow) {
        newValue.on = false
      }

      get().updateMedia(kind, newValue)
    },
    addCleanupFunction: (fn) => {
      set({ cleanupFunctions: [...get().cleanupFunctions, fn] })
    }
  }))
)

export const useCall = callStore

export const callActions: CallActions = callStore.getState()
