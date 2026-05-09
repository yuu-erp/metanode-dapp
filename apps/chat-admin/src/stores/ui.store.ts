import { create } from 'zustand'

export type UiStore = {
  searchValue: string
  setSearchValue: (searchValue: string) => void
  resetSearch: () => void
  status: string
  setStatus: (value: string) => void
  role: string
  setRole: (value: string) => void
}

export const useUiStore = create<UiStore>()((set) => ({
  searchValue: '',
  setSearchValue: (searchValue) => set({ searchValue }),
  resetSearch: () => set({ searchValue: '' }),
  status: 'all',
  setStatus: (status) => set({ status }),
  role: 'all',
  setRole: (role) => set({ role })
}))

export const uiActions = useUiStore.getState()
