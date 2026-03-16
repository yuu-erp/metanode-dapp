import { create } from 'zustand'

export type CallStoreState = {
  onMicro: boolean
  onCamera: boolean
  localStream?: MediaStream
  loadingStatus: string
  isDone: boolean
}

export type CallStore = CallStoreState & {
  toggleMicro: (value?: boolean) => void
  toggleCamera: (value?: boolean) => void
}

export const useCallStore = create<CallStore>()((set, get) => ({
  onCamera: true,
  onMicro: true,
  loadingStatus: 'Loading...',
  isDone: false,
  toggleMicro: (value) => {
    const { localStream, onMicro } = get()
    if (!localStream) return
    const newValue = value ?? !onMicro
    const audioTracks = localStream.getAudioTracks()
    audioTracks.forEach((track) => {
      track.enabled = newValue
    })
    set({ onMicro: newValue })
  },
  toggleCamera: (value) => {
    const { localStream, onCamera } = get()
    if (!localStream) return
    const newValue = value ?? !onCamera
    const videoTracks = localStream.getVideoTracks()
    videoTracks.forEach((track) => {
      track.enabled = newValue
    })
    set({ onCamera: newValue })
  }
}))
