import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ShareState = {
  shareOrder: string[] // giữ thứ tự
  shareMap: Record<string, true> // lookup nhanh
  activeShareUser: string | null // explicit
  shareLoading: boolean
}

export type ShareActions = {
  toggleShareUser: (user: string, value: boolean) => void
  reset: () => void
}

export type ShareStore = ShareState & ShareActions

const initialState: ShareState = {
  shareMap: {},
  shareOrder: [],
  activeShareUser: null,
  shareLoading: false
}

export const shareStore = create<ShareStore>()(
  immer((set) => ({
    ...initialState,

    toggleShareUser: (user, value) => {
      set((s) => {
        if (value) {
          if (!s.shareMap[user]) {
            s.shareMap[user] = true
            s.shareOrder.push(user)
          }
        } else {
          if (s.shareMap[user]) {
            delete s.shareMap[user]
            s.shareOrder = s.shareOrder.filter((u) => u !== user)
          }
        }

        s.activeShareUser = s.shareOrder[s.shareOrder.length - 1] ?? null
      })
    },

    reset: () => {
      set(() => initialState)
    }
  }))
)

export const useShareStore = shareStore

export const shareActions = shareStore.getState() as ShareActions
