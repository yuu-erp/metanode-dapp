import { start } from 'call-core'
import { type PropsWithChildren, type ReactNode, useEffect, useState } from 'react'
import { type Callbacks, setCallbacks, setEventLog } from '~/clients'
import { type EventBusRequest } from '~/clients/event-log/core'
import { useInitLocalMedia, useInitRoomInfo } from '~/hooks'
import { setCallReady } from '~/services'
import { callContext } from './call-context-instance'
import { EventLogManager } from './EventLogManager'

export type { CallContext } from './call-context-instance'

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
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    registerEventLog()
    setCallbacks(callbacks)
    setEventLog(eventLog)
    const id = requestAnimationFrame(() => setBootstrapped(true))
    return () => cancelAnimationFrame(id)
  }, [callbacks, eventLog, registerEventLog])

  useEffect(() => {
    setCallReady(true)
    start()
  }, [])

  const ready = roomReady && mediaReady && bootstrapped

  return (
    <callContext.Provider value={{}}>
      {ready ? children : fallBack}
      {ready && <EventLogManager />}
    </callContext.Provider>
  )
}
