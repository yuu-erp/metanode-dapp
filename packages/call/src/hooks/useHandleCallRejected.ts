import { useRef } from 'react'
import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { roomActions, roomStore } from '~/stores'

export function useHandleCallRejected() {
  const ref = useRef(false)

  useEventLog(
    'CallRejected',
    () => {
      if (ref.current) return
      ref.current = true
      void enCallAndCloseView()
    },
    (e) => {
      const { isMeet, roomId } = roomStore.getState()
      return !isMeet && !!roomId && roomActions.isMyRoom(e)
    },
  )
}
