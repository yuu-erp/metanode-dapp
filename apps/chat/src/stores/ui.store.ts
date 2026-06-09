import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
export type PendingMention = { id: string; display: string }

export type UiStore = {
  addCancelId: (id: string) => void
  cancelIds: string[]

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
  discardRecording: boolean
  setDiscardRecording: (value: boolean) => void
  upFileProgress: Record<string, number>
  setUpFileProgress: (key: string, progress: number) => void
}
export const useUiStore = create<UiStore>()(
  immer((set, get) => ({
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
    setMicOpen: (micOpen) => set({ micOpen }),
    discardRecording: false,
    setDiscardRecording: (discardRecording) => set({ discardRecording }),
    upFileProgress: {},
    setUpFileProgress: (id, progress) => {
      set((s) => {
        if (progress >= 100) {
          delete s.upFileProgress[id]
        } else {
          s.upFileProgress[id] = progress
        }
      })
    },
    cancelIds: [],
    addCancelId: (id) => {
      set({ cancelIds: [...new Set([...get().cancelIds, id])] })
    }
  }))
)

export const uiActions = useUiStore.getState()
