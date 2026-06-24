import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { mediaActions, roomActions, roomStore, userActions } from '~/stores'

export function useHandleLeaveRequested() {
  useEventLog(
    'LeaveRequested',
    async (e) => {
      if (!roomActions.isMyRoom) return
      const { isMeet } = roomStore.getState()
      if (isMeet) {
        console.log('trigger remove user')
        mediaActions.removeUser(e.requester)
        userActions.removeUser(e.requester)
      } else {
        await enCallAndCloseView()
      }
    },
    roomActions.isMyRoom
  )
}
