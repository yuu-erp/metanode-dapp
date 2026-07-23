import { compareAddress } from '~/utils'
import { create } from 'zustand'

export type RoomState = {
  roomId: string
  isCaller: boolean
  caller: string
  callee: string
  isMeet: boolean
  address: string
  isMeeting: boolean
  hiddenAddress: string
}

export type RoomActions = {
  isEventOwnedByMe: (e: any, user: string) => boolean
  isMyRoom: (e: { roomId: string }) => boolean
  reset: () => void
  isMyAddress: (address: string) => boolean
}

export type RoomStore = RoomState & RoomActions

const initialState: RoomState = {
  roomId: '',
  isCaller: false,
  caller: '',
  callee: '',
  isMeet: false,
  address: '',
  isMeeting: false,
  hiddenAddress: ''
}

export const roomStore = create<RoomStore>()((set, get) => ({
  ...initialState,
  reset: () => {
    set({ ...initialState })
  },
  isMyAddress: (add) => compareAddress(add, get().hiddenAddress),
  isEventOwnedByMe: (e, user) => {
    const s = get()
    const isMine = compareAddress(s.hiddenAddress, user)
    console.log('hehe', { s, user, isMine })
    return isMine && compareAddress(s.roomId, e.roomId)
  },
  isMyRoom: (e) => compareAddress(get().roomId, e.roomId)
}))

export const useRoomStore = roomStore

export const roomActions = roomStore.getState() as RoomActions
