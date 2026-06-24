import { start } from 'call-core'
import { createContext, PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react'
import { Callbacks, setCallbacks, setEventLog } from '~/clients'
import { EventBusRequest } from '~/clients/event-log/core'
import { useInitLocalMedia, useInitRoomInfo } from '~/hooks'
import { setCallReady } from '~/services'
import { EventLogManager } from './EventLogManager'

export type CallContext = {}

export const callContext = createContext<CallContext>(null!)

export type CallProviderProps = PropsWithChildren &
  Partial<Callbacks> & {
    search?: any
    fallBack?: ReactNode
    meetingAddress: string
    eventLog: EventBusRequest
    registerEventLog: () => any
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
  const [_ready, setReady] = useState(false)

  useEffect(() => {
    registerEventLog()
    setCallbacks(callbacks)
    setEventLog(eventLog)
    setReady(true)
  }, [])

  useEffect(() => {
    setCallReady(true)
    start()
  }, [])

  useEffect(() => {
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
