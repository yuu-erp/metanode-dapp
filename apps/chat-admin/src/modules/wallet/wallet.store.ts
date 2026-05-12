import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WalletStore = {
  /** Trạng thái hiện tại (đang chọn, chưa submit) */
  currentActive: string
  setCurrentActive: (address: string) => void

  /** Trạng thái đã submit thành công (được persist) */
  persistedActive: string

  /**
   * Gọi khi submit thành công:
   * chốt lựa chọn hiện tại thành persisted.
   */
  commitCurrentToPersisted: () => void
  reset: () => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      currentActive: '',
      setCurrentActive: (address) => set({ currentActive: address }),

      persistedActive: '',

      commitCurrentToPersisted: () => {
        const { currentActive } = get()
        set({ persistedActive: currentActive })
      },

      reset: () => set({ currentActive: '', persistedActive: '' })
    }),
    {
      name: `[chat-admin]wallet-store`,
      partialize: (state) => ({ persistedActive: state.persistedActive })
    }
  )
)

export const walletActions = useWalletStore.getState()
