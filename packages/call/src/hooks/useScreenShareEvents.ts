import { sendCommand } from '@metanodejs/system-core'
import { useEventLog } from '~/clients'
import { roomActions, shareActions } from '~/stores'
import { formatAddress } from '~/utils'

export function useScreenShareEvents() {
  useEventLog(
    'ScreenShareStarted',
    (e) => {
      sendCommand('remoteScreenShareStarted', {
        sourceUser: e.sharer
      })

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
      sendCommand('remoteScreenShareStopped', {
        sourceUser: e.sharer
      })
      shareActions.toggleShareUser(formatAddress(e.sharer), false)
    },
    (e) => {
      const rs = roomActions.isMyRoom(e)

      return rs
    }
  )
}
