import { isCameraOn, isMicMuted } from '@metanodejs/system-core'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { UserSource } from '~/@types'

export type CallState = {
  connected: boolean
  joined: boolean
  allowed: Record<UserSource, boolean>
  enabled: Record<UserSource, boolean>
  ending: boolean
  trackPulled: boolean
  requesters: string[]
}

export type CallActions = {
  fetchPermission: () => Promise<void>
  reset: () => void
  toggleEnabled: (source: UserSource, value: boolean) => void
  toggleRequester: (user: string, value: boolean) => void
  initEnable: () => void
}

export type CallStore = CallState & CallActions

const defaultUserSourceState: Record<UserSource, boolean> = {
  camera: true,
  microphone: true
}

const initialState = {
  connected: false,
  joined: false,
  ending: false,
  trackPulled: false,
  requesters: []
}

export const callStore = create<CallStore>()(
  immer((set, get) => ({
    ...initialState,
    allowed: { ...defaultUserSourceState },
    enabled: { ...defaultUserSourceState },
    initEnable: async () => {
      const camOn = await isCameraOn()
      const micMute = await isMicMuted()
      set((s) => {
        s.enabled.camera = camOn
        s.enabled.microphone = micMute
      })
    },

    toggleRequester: (user, value) => {
      set((s) => {
        const exist = s.requesters.includes(user)
        if (exist && !value) {
          s.requesters = s.requesters.filter((u) => u !== user)
        } else if (!exist && value) {
          s.requesters.push(user)
        }
      })
    },
    toggleEnabled: (source, value) =>
      set((s) => {
        s.enabled[source] = value
      }),
    reset: () => {
      const { allowed } = get()
      set({
        ...initialState,
        allowed
      })
    },

    fetchPermission: async () => {
      if (window.finSdk) return
      const [camera, microphone] = await Promise.all([
        navigator.permissions.query({ name: 'camera' }),
        navigator.permissions.query({ name: 'microphone' })
      ])
      const allowed = {
        camera: camera.state !== 'denied',
        microphone: microphone.state !== 'denied'
      }
      set({ allowed })
    }
  }))
)

export const useCallStore = callStore

export const callActions = callStore.getState() as CallActions
