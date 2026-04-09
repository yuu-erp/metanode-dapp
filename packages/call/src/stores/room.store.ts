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
  isMeeting: false
}

export const roomStore = create<RoomStore>()((set, get) => ({
  ...initialState,
  reset: () => {
    set({ ...initialState })
  },
  isMyAddress: (add) => compareAddress(add, get().address),
  isEventOwnedByMe: (e, user) => {
    const { address, roomId } = get()
    return compareAddress(address, user) && compareAddress(roomId, e.roomId)
  },
  isMyRoom: (e) => compareAddress(get().roomId, e.roomId)
}))

export const useRoomStore = roomStore

export const roomActions = roomStore.getState() as RoomActions
