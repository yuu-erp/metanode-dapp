import { create } from 'zustand'

export type AddGroupStore = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useAddGroup = create<AddGroupStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open })
}))

export const addGroupActions = useAddGroup.getState()
