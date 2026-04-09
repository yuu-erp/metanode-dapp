import { useEffect } from 'react'
import {
  callActions,
  mediaActions,
  roomActions,
  rtcActions,
  shareActions,
  userActions
} from '~/stores'

export function useCallSessionCleanup() {
  useEffect(() => {
    return () => {
      callActions.reset()
      mediaActions.reset()
      roomActions.reset()
      rtcActions.reset()
      shareActions.reset()
      userActions.reset()
    }
  }, [])
}
