import { create } from 'zustand'

export type PendingMention = { id: string; display: string }

export type UiStore = {
  mentionPopoverOpen: boolean
  setMentionPopoverOpen: (mentionPopoverOpen: boolean) => void
  pendingMention: PendingMention | null
  setPendingMention: (mention: PendingMention | null) => void
  searchOpen: boolean
  searchValue: string
  setSearchOpen: (searchOpen?: boolean) => void
  setSearchValue: (searchValue: string) => void
  resetSearch: () => void
  pinOpen: boolean
  setPinOpen: (value: boolean) => void
}
export const useUiStore = create<UiStore>()((set, get) => ({
  mentionPopoverOpen: false,
  setMentionPopoverOpen: (mentionPopoverOpen) => set({ mentionPopoverOpen }),
  pendingMention: null,
  setPendingMention: (pendingMention) => set({ pendingMention }),
  searchOpen: false,
  searchValue: '',
  setSearchOpen: (searchOpen) => set({ searchOpen: searchOpen ?? !get().searchOpen }),
  setSearchValue: (searchValue) => set({ searchValue }),
  resetSearch: () => set({ searchOpen: false, searchValue: '' }),
  pinOpen: false,
  setPinOpen: (pinOpen) => set({ pinOpen })
}))

export const uiActions = useUiStore.getState()
