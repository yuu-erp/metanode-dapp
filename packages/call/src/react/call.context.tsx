import { createContext, PropsWithChildren, ReactNode, useContext, useEffect, useState } from 'react'
import { Callbacks, setCallbacks, setEventLog } from '~/clients'
import { EventBusRequest } from '~/clients/event-log/core'
import { useInitLocalMedia, useInitRoomInfo } from '~/hooks'
import { statusActions, useRoomStore, useStatusStore } from '~/stores'
import { EventLogManager } from './EventLogManager'
import { setCallReady } from '~/services'

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
    useStatusStore.setState({
      from: Math.floor(performance.now())
    })
    return () => {
      const to = Math.floor(performance.now())
      const roomInfo = useRoomStore.getState()

      useStatusStore.setState({
        to
      })
      statusActions.setStatus(roomInfo.isCaller ? 'outcoming' : 'incoming')
    }
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
