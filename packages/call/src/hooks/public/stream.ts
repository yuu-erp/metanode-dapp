import { useShallow } from 'zustand/shallow'
import { useMediaStore, useRoomStore, useShareStore } from '~/stores'
import { toStreamKey } from '~/utils'

export function useParticipantMediaStreams(user: string) {
  return useMediaStore(
    useShallow((s) => ({
      stream: s.streams[toStreamKey(user, 'user')]?.stream,
      shareStream: s.streams[toStreamKey(user, 'display')]?.stream
    }))
  )
}

export function useActiveShareStreamKey() {
  return useShareStore((s) => (s.activeShareUser ? toStreamKey(s.activeShareUser, 'display') : ''))
}

export function useStream(streamKey: string) {
  return useMediaStore((s) => s.streams[streamKey]?.stream)
}

export function useMyStream() {
  const address = useRoomStore((s) => s.address)
  return useMediaStore(
    useShallow((s) => ({
      stream: s.streams[toStreamKey(address, 'user')]?.stream,
      shareStream: s.streams[toStreamKey(address, 'display')]?.stream
    }))
  )
}
