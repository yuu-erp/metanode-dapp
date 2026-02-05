'use client'

import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventLogState {}

const EventLogContext = createContext<EventLogState | undefined>(undefined)

export function EventLogProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  React.useEffect(() => {
    if (!account?.address || !account.contractAddress) return
    const eventLog = container.eventLogContainer.eventLog
    const eventBus = container.eventBus
    const meetingAddress = import.meta.env.VITE_MEETING
    eventLog.registerEvent(account.address, [account.contractAddress, meetingAddress])

    const offMessageReceived = eventLog.on('MessageReceived', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('message.received', data)
    })

    const offReaction = eventLog.on('PartnerMessageReacted', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('reaction.received', data)
    })

    const offPartnerMessageEdited = eventLog.on('PartnerMessageEdited', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('message.partneredited', data)
    })

    const offPartnerMessageDeleted = eventLog.on('PartnerMessageDeleted', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('message.partnerdeleted', data)
    })

    const offDataChannel = eventLog.on('DataChannel', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('webrtc.datachannel.received', data)
    })

    const offGroupCreated = eventLog.on('GroupCreated', (data) => {
      eventBus.emit('group.created', data)
    })

    const offCallReceived = eventLog.on('CallReceived', (data) => {
      console.log('eventLog CallReceived event:', data)
      eventBus.emit('call.received', data)
    })

    return () => {
      offMessageReceived()
      offReaction()
      offPartnerMessageEdited()
      offPartnerMessageDeleted()
      offDataChannel()
      offGroupCreated()
      offCallReceived()
    }
  }, [account?.address, account?.contractAddress])

  return <EventLogContext.Provider value={{}}>{children}</EventLogContext.Provider>
}

export function useEventLog() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
