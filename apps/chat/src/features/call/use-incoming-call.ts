import { container } from '@/container'
import { useSyncCall } from '@/hooks/sync/use-sync-call'
import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { useCurrentAccount } from '@/shared/hooks'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { useEventLog } from '@/shared/hooks/use-event-log'
import { compareAddress } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'
import type { AppEvents } from '@/types/app-events'
import { useEffect, useState } from 'react'

export const useIncomingCall = () => {
  const [incomingCall, setIncomingCall] = useState<MeetingViewInput | null>(null)
  const { data: account } = useCurrentAccount()
  const { mutate } = useGoToMeetingView()
  const syncCall = useSyncCall()

  useEffect(() => {
    console.log('  1', account)
    if (!account) return
    const handleCallReceived = async (event: AppEvents['call.received']) => {
      setIncomingCall({
        ...event,
        roomId: formatAddress(event.roomId ?? '')
      })
    }
    container.eventBus.on('call.received', handleCallReceived)
    return () => {
      container.eventBus.off('call.received', handleCallReceived)
    }
  }, [account])

  const acceptCall = async () => {
    if (!incomingCall || !account) return
    mutate(incomingCall)
  }

  const getConId = async () => {
    if (!incomingCall || !account) return ''
    return incomingCall.isMeet ? incomingCall.callee : incomingCall.caller
  }

  const rejectCall = async () => {
    if (!account || !incomingCall) return
    setIncomingCall(null)
    const conversationId = await getConId()
    console.log('[rejectCall] 1', { conversationId, incomingCall })
    await syncCall(conversationId, incomingCall.conversationType, { callStatus: 'rejected' })

    await container.meetingContract.rejectCall({
      from: account.hiddenAddress,
      inputData: {
        _caller: incomingCall.caller,
        _roomId: incomingCall.roomId!,
        owner: account.address
      }
    })
  }

  useEventLog('LeaveRequested', async (data) => {
    console.log('[LeaveRequested]', {
      incomingCall,
      account,
      data
    })
    if (!incomingCall || !account) return
    console.log('[LeaveRequested] 1')
    if (!compareAddress(data.roomId, incomingCall.roomId!)) return
    console.log('[LeaveRequested] 2', compareAddress(data.roomId, incomingCall.roomId!))

    const conversationId = await getConId()
    console.log('[LeaveRequested] 3', conversationId)
    setIncomingCall(null)
    await syncCall(conversationId, incomingCall.conversationType, { callStatus: 'missed' })
  })

  return {
    incomingCall,
    acceptCall,
    rejectCall
  }
}
