import { useEffect, useState } from 'react'
import { callActions, mediaActions, roomStore } from '~/stores'
import { userActions } from '~/stores/user.store'

export function useInitLocalMedia() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initCameraTracks = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      const track = stream.getTracks()[0]
      if (track) {
        mediaActions.setLocalTrack('camera', track)
        mediaActions.setLocalTrack('screen', track)
      }
    }

    const initMicrophoneTracks = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })
      const track = stream.getTracks()[0]
      if (track) {
        mediaActions.setLocalTrack('microphone', track)
        mediaActions.setLocalTrack('systemAudio', track)
      }
    }

    const init = async () => {
      const { address } = roomStore.getState()
      userActions.addUser(address)
      await Promise.allSettled([initCameraTracks(), initMicrophoneTracks()])
      await callActions.fetchPermission()
      setReady(true)
    }

    init()
  }, [])

  return ready
}
