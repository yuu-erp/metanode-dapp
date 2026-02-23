import { container } from '@/container'
import type { EventMap } from '@/modules/eventlogs'
import { useCurrentAccount } from '@/shared/hooks'
import { formatAddress } from '@/shared/utils'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { IncomingCallData } from './types'

export const useIncomingCall = () => {
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)
  const { data: account } = useCurrentAccount()
  const navigate = useNavigate()

  useEffect(() => {
    if (!account) return
    const handleCallReceived = async (event: EventMap['CallReceived']) => {
      console.log('CallReceived event:', event, account)
      if (formatAddress(event.callee) === formatAddress(account.contractAddress)) {
        const userProfile = await container.callService.handleCallReceived(account, event.caller)
        setIncomingCall({
          caller: event.caller,
          callee: event.callee,
          roomId: event.roomId,
          name: [userProfile.firstName, userProfile.lastName].join(' '),
          avatar: userProfile.avatar
        })
      }
    }
    container.eventBus.on('call.received', handleCallReceived)
    return () => {
      container.eventBus.off('call.received', handleCallReceived)
    }
  }, [account])

  const acceptCall = async () => {
    if (!incomingCall || !account) return
    try {
      const data = await container.callService.acceptCall(
        account,
        incomingCall.roomId,
        incomingCall.caller,
        incomingCall.callee
      )
      //@ts-ignore
      // if (window?.finSdk) {
      //   chatClient.useMeetingData.getState().setData(data)
      //   navigate({ to: '/meeting' })
      // }
      setIncomingCall(null)
    } catch (error) {
      console.error('Failed to accept call:', error)
    }
  }

  const rejectCall = () => {
    setIncomingCall(null)
  }

  return {
    incomingCall,
    acceptCall,
    rejectCall
  }
}
