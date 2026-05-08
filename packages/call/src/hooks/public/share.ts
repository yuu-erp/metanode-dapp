import { useCallback } from 'react'
import { useShallow } from 'zustand/shallow'
import { Source } from '~/@types'
import { blockchain, onError } from '~/clients'
import {
  mediaActions,
  mediaStore,
  roomStore,
  shareActions,
  shareStore,
  useRoomStore,
  useShareStore
} from '~/stores'

export function useUserShareState(user: string) {
  return useShareStore((s) => s.shareMap[user])
}

export function useActiveShareUser() {
  return useShareStore((s) => s.activeShareUser)
}

export function useShareState() {
  const address = useRoomStore((s) => s.address)

  return useShareStore(
    useShallow((s) => ({
      isSharing: s.shareLoading,
      isShare: s.shareMap[address]
    }))
  )
}

export function useScreenShareActions() {
  const getShareState = useCallback(() => {
    const { shareMap } = shareStore.getState()
    const { address } = roomStore.getState()
    return shareMap[address]
  }, [])

  const setSharing = useCallback((value: boolean) => {
    shareStore.setState({ shareLoading: value })
  }, [])

  const cleanupTrack = useCallback((source: Source) => {
    const { localTracks } = mediaStore.getState()
    const track = localTracks[source]
    if (!track) return
    track.stop()
    track.onended = null
    mediaActions.setLocalTrack(source, null)
  }, [])

  const startShareScreen = useCallback(async () => {
    if (getShareState()) return
    setSharing(true)
    try {
      const { address, roomId } = roomStore.getState()
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      shareActions.toggleShareUser(address, true)

      stream.getTracks().forEach((t) => {
        t.onended = () => {
          stopShareScreen()
        }

        switch (t.kind) {
          case 'video': {
            mediaActions.setLocalTrack('screen', t)
            break
          }
          case 'audio': {
            mediaActions.setLocalTrack('systemAudio', t)
            break
          }
        }
      })

      await blockchain.startScreenShare({
        roomId
      })
    } catch (error) {
      onError(error, 'startShareScreen')
    } finally {
      setSharing(false)
    }
  }, [])

  const stopShareScreen = useCallback(async () => {
    if (!getShareState()) return
    setSharing(true)
    try {
      const { address, roomId } = roomStore.getState()
      shareActions.toggleShareUser(address, false)
      cleanupTrack('screen')
      cleanupTrack('systemAudio')

      await blockchain.stopScreenShare({
        roomId
      })
    } catch (error) {
      onError(error, 'stopShareScreen')
    } finally {
      setSharing(false)
    }
  }, [])

  return { startShareScreen, stopShareScreen }
}
