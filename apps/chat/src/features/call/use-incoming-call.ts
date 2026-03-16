import { container } from '@/container'
import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { useCurrentAccount } from '@/shared/hooks'
import type { AppEvents } from '@/types/app-events'
import { useEffect, useState } from 'react'
import { useGoToMeetingView } from '../meeting'
import { useEventLog } from '../call-view'
import { compareAddress } from '@/modules'

export const useIncomingCall = () => {
  const [incomingCall, setIncomingCall] = useState<MeetingViewInput | null>(null)
  const { data: account } = useCurrentAccount()
  const { mutate } = useGoToMeetingView()

  useEffect(() => {
    if (!account) return
    const handleCallReceived = async (event: AppEvents['call.received']) => {
      setIncomingCall({ ...event, hiddenAddress: account.hiddenAddress })
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

  const rejectCall = async () => {
    if (!account || !incomingCall) return
    setIncomingCall(null)
    await container.meetingContract.rejectCall({
      from: account.hiddenAddress,
      inputData: {
        _caller: incomingCall.caller,
        _roomId: incomingCall.roomId!
      }
    })
  }

  useEventLog('LeaveRequested', (data) => {
    console.log('thanhduy - LeaveRequested', {
      data,
      incomingCall
    })
    if (!incomingCall) return
    if (!compareAddress(data.roomId, incomingCall.roomId!)) return
    setIncomingCall(null)
  })

  return {
    incomingCall,
    acceptCall,
    rejectCall
  }
}
