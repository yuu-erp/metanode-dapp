import { useCallback } from 'react'
import { blockchain, EventLogData, useEventLog } from '~/clients'
import { roomActions, roomStore } from '~/stores'

export function useAutoRejectCall() {
  const cb = useCallback((e: EventLogData['CallReceived'] | EventLogData['CallReceivedSignal']) => {
    const { address } = roomStore.getState()
    return blockchain.rejectCall({
      _caller: e.caller,
      _roomId: e.roomId,
      owner: address
    })
  }, [])
  useEventLog('CallReceived', cb, (e) => !roomActions.isMyRoom(e))
  useEventLog('CallReceivedSignal', cb, (e) => !roomActions.isMyRoom(e))
}
