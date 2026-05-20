import { create } from 'zustand'
import { persist } from 'zustand/middleware/persist'

export type FlowStore = {
  from: number
  to: number
  id: string
  type: string
  resetCallData: () => void
}

export const useFlowStore = create<FlowStore>()(
  persist(
    () => ({
      from: 0,
      to: 0,
      id: '',
      type: '',
      resetCallData: () => {
        useFlowStore.setState({ from: 0, to: 0, id: '', type: '' })
      }
    }),
    {
      name: 'chat-flow',
      partialize: (state) => ({ from: state.from, to: state.to, id: state.id, type: state.type })
    }
  )
)

export const flowActions = useFlowStore.getState()
