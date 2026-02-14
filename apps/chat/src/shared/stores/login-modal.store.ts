import { create } from 'zustand'

export interface LoginModalTypes {
  isOpen: boolean
}

export interface LoginModalStore extends LoginModalTypes {
  onClose: () => void
  onOpen: () => void
}

export const useLoginModalStore = create<LoginModalStore>((set) => ({
  isOpen: false,
  onClose: () => set({ isOpen: false }),
  onOpen: () => set({ isOpen: true })
}))
