import { useEventLog } from '~/clients'
import { roomActions, userActions } from '~/stores'
import { formatAddress } from '~/utils'

export function useRaiseHandEvent() {
  useEventLog(
    'RaiseHandUpdated',
    (e) => {
      userActions.toggleRaiseHandUser(formatAddress(e.user), e.isRaised)
    },
    (e) => roomActions.isMyRoom(e)
  )

  useEventLog(
    'FrontendEvent',
    (e) => {
      userActions.toggleRaiseHandUser(formatAddress(e.toUser), false)
    },
    (e) =>
      roomActions.isMyRoom(e) && e.eventType === 'JOIN_ANSWER' && !roomActions.isMyAddress(e.toUser)
  )
}
