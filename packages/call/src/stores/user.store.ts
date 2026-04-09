import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type UserState = {
  users: string[]
  raiseHandUsers: string[]
}

export type UserActions = {
  addUser: (user: string) => void
  toggleRaiseHandUser: (user: string, value: boolean) => void
  reset: () => void
  removeUser: (user: string) => void
}

export type UserStore = UserState & UserActions

export const userStore = create<UserStore>()(
  immer((set, get) => ({
    users: [],
    raiseHandUsers: [],

    addUser: (user) => {
      set((s) => {
        if (!s.users.includes(user)) s.users.push(user)
      })
    },
    toggleRaiseHandUser: (user, value) => {
      set((s) => {
        const exist = s.raiseHandUsers.includes(user)
        if (exist && !value) {
          s.raiseHandUsers = s.raiseHandUsers.filter((u) => u !== user)
        } else if (!exist && value) {
          s.raiseHandUsers.push(user)
        }
      })
    },
    reset: () => {
      set((s) => {
        s.users = []
        s.raiseHandUsers = []
      })
    },
    removeUser: (user) => {
      get().toggleRaiseHandUser(user, false)
      set({ users: get().users.filter((u) => u !== user) })
    }
  }))
)

export const useUserStore = userStore

export const userActions = userStore.getState() as UserActions
