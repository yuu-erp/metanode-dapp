import { setState } from 'call-core'
import { useRef } from 'react'
import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { roomActions, roomStore } from '~/stores'

export function useHandleCallRejected() {
  const ref = useRef(false)

  useEventLog(
    'CallRejected',
    (e) => {
      if (ref.current) return
      ref.current = true
      setState({ kind: 'reject' })
      console.log('[useHandleCallRejected]', e)
      enCallAndCloseView()
    },
    (e) => {
      const { isMeet, roomId } = roomStore.getState()
      return !isMeet && !!roomId && roomActions.isMyRoom(e)
    }
  )
}
