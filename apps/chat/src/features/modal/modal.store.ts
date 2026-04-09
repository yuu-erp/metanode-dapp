import { create } from 'zustand'

export type ModalStore = {
  joinMeeting?: boolean
  meetingUrl?: boolean
  reload?: boolean
  permissonWarning?: string
  resetWhenOutCall: () => void
}

const defaultCallModalState = {
  meetingUrl: false,
  reload: false,
  audioPopup: false,
  videoPopup: false
}

export const useModalStore = create<ModalStore>()((set) => ({
  resetWhenOutCall: () => {
    set({ ...defaultCallModalState })
  }
}))

export const modalActions = useModalStore.getState()
