import { formatAddress } from '~/utils'
import { useEventLog } from '~/clients'
import { callActions, roomActions } from '~/stores'

export function useRequesterEvent() {
  useEventLog(
    'JoinRequestPending',
    (e) => {
      callActions.toggleRequester(formatAddress(e.participant), true)
    },
    roomActions.isMyRoom
  )
}
