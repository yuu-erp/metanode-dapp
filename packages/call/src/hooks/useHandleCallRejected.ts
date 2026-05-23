import { useRef } from 'react'
import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { roomActions, roomStore, statusActions } from '~/stores'

export function useHandleCallRejected() {
  const ref = useRef(false)

  useEventLog(
    'CallRejected',
    (e) => {
      if (ref.current) return
      ref.current = true
      statusActions.setStatus('rejected')
      console.log('[useHandleCallRejected]', e)
      enCallAndCloseView()
    },
    (e) => {
      const { isMeet, roomId } = roomStore.getState()
      return !isMeet && !!roomId && roomActions.isMyRoom(e)
    }
  )
}
