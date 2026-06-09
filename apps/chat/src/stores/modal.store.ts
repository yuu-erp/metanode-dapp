import { create } from 'zustand'

export type ModalStore = {
  open: boolean
  kind: string
  meta?: any
  setOpen: (kind: string, meta?: any) => void
  close: () => void
}

export const useModalStore = create<ModalStore>()((set) => ({
  open: false,
  kind: '',
  setOpen: (kind, meta) => set({ kind, open: true, meta }),
  close: () => set({ open: false, kind: '', meta: undefined })
}))

export const modalActions = useModalStore.getState()
