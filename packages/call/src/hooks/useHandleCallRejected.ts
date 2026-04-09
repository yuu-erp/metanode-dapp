import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { roomActions, roomStore } from '~/stores'

export function useHandleCallRejected() {
  useEventLog('CallRejected', enCallAndCloseView, (e) => {
    const { isMeet, roomId } = roomStore.getState()
    return !isMeet && !!roomId && roomActions.isMyRoom(e)
  })
}
