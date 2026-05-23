import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StatusStore = {
  from: number
  to: number
  id: string
  type: string
  status: string
  syncing: boolean
  resetCallData: () => void
  setStatus: (status: string) => void
}

export const useStatusStore = create<StatusStore>()(
  persist(
    (_set, get) => ({
      from: 0,
      to: 0,
      id: '',
      type: '',
      status: '',
      syncing: false,
      resetCallData: () => {
        useStatusStore.setState({ from: 0, to: 0, id: '', type: '', status: '', syncing: false })
      },
      setStatus: (status: string) => {
        if (!!get().status) return
        useStatusStore.setState({ status })
      }
    }),
    {
      name: 'chat-flow',
      partialize: (state) => ({ from: state.from, to: state.to, id: state.id, type: state.type })
    }
  )
)

export const statusActions = useStatusStore.getState()
