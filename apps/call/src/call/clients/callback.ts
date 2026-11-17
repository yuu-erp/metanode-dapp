import { RoomState } from '~/stores'

export type Callbacks = {
  onRoomIdFetched: (roomId: string) => void
  onEndCall: (room: RoomState) => void
  fetchNameByUser: (myAddress: string, user: string) => Promise<string>
}

const callbacks: Partial<Callbacks> = {}

export function setCallbacks(_callbacks: Partial<Callbacks>) {
  Object.assign(callbacks, _callbacks)
}

export function getCallback<K extends keyof Callbacks>(name: K): Callbacks[K] {
  const fn = callbacks[name]
  if (!fn) throw new Error(`[getCallback] invalid name: ${name}`)
  return fn
}
