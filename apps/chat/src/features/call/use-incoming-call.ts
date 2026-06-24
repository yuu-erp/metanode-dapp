import { container } from '@/container'
import { useSyncCall } from '@/hooks/sync/use-sync-call'
import type { MeetingViewInput } from '@/modules/meeting/meeting.type'
import { useCurrentAccount } from '@/shared/hooks'
import { useGoToMeetingView } from '@/shared/hooks/call/use-go-to-meeting-view'
import { useEventLog } from '@/shared/hooks/use-event-log'
import { compareAddress } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'
import type { AppEvents } from '@/types/app-events'
import { useRef, useState } from 'react'

export const useIncomingCall = () => {
  const [incomingCall, setIncomingCall] = useState<MeetingViewInput | null>(null)
  const { data: account } = useCurrentAccount()
  const { mutate } = useGoToMeetingView()
  const syncCall = useSyncCall()
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
    }
  }

  const handleCallReceived = async (event: AppEvents['call.received']) => {
    if (!account) return
    cleanup()
    timeout.current = setTimeout(async () => {
      cleanup()
      setIncomingCall(null)
      if (!incomingCall) return
      const conversationId = await getConId()
      await syncCall(
        {
          id: conversationId,
          type: incomingCall.conversationType
        },
        { callStatus: 'missed' }
      )
    }, 1000 * 60)

    setIncomingCall({
      ...event,
      roomId: formatAddress(event.roomId ?? '')
    })
  }

  useEventLog('CallReceivedSignal', (data) => {
    console.log('thanhduy - CallReceivedSignal', data)
    if (!account) return
    if (compareAddress(data.caller, account.address)) return
    handleCallReceived({
      address: account.address,
      callee: data.callee,
      caller: data.caller,
      isCaller: false,
      isMeet: true,
      roomId: data.roomId,
      conversationType: 'group'
    })
  })

  useEventLog('CallReceived', async (data) => {
    if (!account) return
    const callerContractAddress = await container.factoryContract.getUserContract({
      from: account.address,
      inputData: { user: data.owner }
    })

    handleCallReceived({
      address: account.address,
      callee: data.callee,
      caller: callerContractAddress,
      isCaller: formatAddress(data.caller) === formatAddress(account.address),
      isMeet: false,
      roomId: data.roomId,
      conversationType: 'p2p'
    })
  })

  const acceptCall = async () => {
    if (!incomingCall || !account) return
    cleanup()
    mutate(incomingCall)
    setIncomingCall(null)
  }

  const getConId = async () => {
    if (!incomingCall || !account) return ''
    return incomingCall.isMeet ? incomingCall.callee : incomingCall.caller
  }

  const rejectCall = async () => {
    if (!account || !incomingCall) return
    cleanup()
    setIncomingCall(null)
    const conversationId = await getConId()
    console.log('[rejectCall] 1', { conversationId, incomingCall })
    await syncCall(
      {
        id: conversationId,
        type: incomingCall.conversationType
      },
      { callStatus: 'rejected' }
    )

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
    await syncCall(
      {
        id: conversationId,
        type: incomingCall.conversationType
      },
      { callStatus: 'missed' }
    )
  })

  return {
    incomingCall,
    acceptCall,
    rejectCall
  }
}
