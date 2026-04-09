import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { mediaActions, roomActions, roomStore } from '~/stores'

export function useHandleLeaveRequested() {
  useEventLog(
    'LeaveRequested',
    async (e) => {
      const { isMeet } = roomStore.getState()
      if (isMeet) {
        mediaActions.removeUser(e.requesters)
      } else {
        await enCallAndCloseView()
      }
    },
    roomActions.isMyRoom
  )
}
