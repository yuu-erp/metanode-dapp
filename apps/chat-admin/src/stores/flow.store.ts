import type { Role } from '@/@types/enum'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FlowStore = {
  role: Role | null
  setRole: (role: Role | null) => void
}
export const useFlowStore = create<FlowStore>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role })
    }),
    {
      name: `[chat-admin]flow-store`,
      partialize: (state) => ({ role: state.role })
    }
  )
)

export const flowActions = useFlowStore.getState()
