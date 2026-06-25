import { useEventLog } from '~/clients'
import { enCallAndCloseView } from '~/services'
import { mediaActions, roomActions, roomStore, userActions, userStore } from '~/stores'

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
        const users = userStore.getState().users
        if (users.length === 1) {
          await enCallAndCloseView()
        }
      } else {
        await enCallAndCloseView()
      }
    },
    roomActions.isMyRoom
  )
}
