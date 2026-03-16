import { create } from 'zustand'
import type { CallState, RequireCallState } from './types'

export type CallStore = CallState & {
  initialize: (value: RequireCallState) => void
  reset: () => void
}

const defaultState: CallState = {
  caller: '',
  callee: '',
  hiddenAddress: '',
  address: '',
  loadingStatus: 'Loading...',
  isCaller: false,
  isMeet: false,
  roomId: undefined,
  sessionId: undefined,
  stream: undefined,
  pc: undefined
}

export const useCall = create<CallStore>()((set) => ({
  ...defaultState,
  reset: () => set({ ...defaultState }),
  initialize: (value) => set({ ...value })
}))
