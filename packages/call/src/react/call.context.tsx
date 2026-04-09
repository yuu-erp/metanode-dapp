import { createContext, PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react'
import { Callbacks, setCallbacks, setEventLog } from '~/clients'
import { RegisterEventLog, useInitLocalMedia, useInitRoomInfo } from '~/hooks'
import { EventLogManager } from './EventLogManager'
import { EventBusRequest } from '~/clients/event-log/core'
import { getStatusConnected } from '@metanodejs/system-core'

export type CallContext = {}

export const callContext = createContext<CallContext>(null!)

export type CallProviderProps = PropsWithChildren &
  Partial<Callbacks> & {
    search?: any
    fallBack?: ReactNode
    meetingAddress: string
    eventLog: EventBusRequest
    registerEventLog: RegisterEventLog
  }

export const CallProvider = ({
  children,
  search,
  fallBack = <p>Call loading...</p>,
  meetingAddress,
  eventLog,
  registerEventLog,
  ...callbacks
}: CallProviderProps) => {
  const roomReady = useInitRoomInfo(search, meetingAddress)
  const mediaReady = useInitLocalMedia()
  // const eventLogReady = useRegisterEventLog(registerEventLog, meetingAddress);
  const [_ready, setReady] = useState(false)

  useEffect(() => {
    setCallbacks(callbacks)
    setEventLog(eventLog)
    setReady(true)
  }, [])

  const ready = roomReady && mediaReady && _ready

  return (
    <callContext.Provider value={{}}>
      {ready ? children : fallBack}
      {ready && <EventLogManager />}
    </callContext.Provider>
  )
}

export function useCall() {
  const context = useContext(callContext)
  if (!context) throw new Error('useCall must use in call context')
  return context
}
