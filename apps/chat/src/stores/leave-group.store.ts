import { create } from 'zustand'

export type LeaveGroupStore = {
  isLeaveGroup: boolean
  setIsLeaveGroup: (isLeaveGroup: boolean) => void
}

export const useLeaveGroupStore = create<LeaveGroupStore>((set) => ({
  isLeaveGroup: false,
  setIsLeaveGroup: (isLeaveGroup) => set({ isLeaveGroup })
}))

export const leaveGroupActions = useLeaveGroupStore.getState()
