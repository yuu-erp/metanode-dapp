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
  addGroupOpen: boolean
  setAddGroupOpen: (value: boolean) => void
  leaveGroupOpen: boolean
  setLeaveGroupOpen: (value: boolean) => void
  micOpen: boolean
  setMicOpen: (value: boolean) => void
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
  setPinOpen: (pinOpen) => set({ pinOpen }),
  addGroupOpen: false,
  setAddGroupOpen: (addGroupOpen) => set({ addGroupOpen }),
  leaveGroupOpen: false,
  setLeaveGroupOpen: (leaveGroupOpen) => set({ leaveGroupOpen }),
  micOpen: false,
  setMicOpen: (micOpen) => set({ micOpen })
}))

export const uiActions = useUiStore.getState()
