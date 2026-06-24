import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StatusStore = {
  from: number
  to: number
  id: string
  status: string
  syncing: boolean
  reset: () => void
}

export const useStatusStore = create<StatusStore>()(
  persist(
    (_set) => ({
      from: 0,
      to: 0,
      id: '',
      status: '',
      syncing: false,
      reset: () => {
        useStatusStore.setState({ from: 0, to: 0, id: '', status: '', syncing: false })
      }
    }),
    {
      name: 'chat-flow',
      partialize: (state) => ({ from: state.from, to: state.to, id: state.id })
    }
  )
)

export const statusActions = useStatusStore.getState()
