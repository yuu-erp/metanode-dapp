import { useEventLog } from '~/clients'
import { roomActions, shareActions } from '~/stores'
import { formatAddress } from '~/utils'

export function useScreenShareEvents() {
  useEventLog(
    'ScreenShareStarted',
    (e) => {
      console.log('ScreenShareStarted', e)
      shareActions.toggleShareUser(formatAddress(e.sharer), true)
    },
    (e) => {
      const rs = roomActions.isMyRoom(e)

      return rs
    }
  )

  useEventLog(
    'ScreenShareStopped',
    (e) => {
      console.log('ScreenShareStopped', e)

      shareActions.toggleShareUser(formatAddress(e.sharer), false)
    },
    (e) => {
      const rs = roomActions.isMyRoom(e)

      return rs
    }
  )
}
