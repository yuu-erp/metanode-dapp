'use client'

import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventLogState {}

const EventLogContext = createContext<EventLogState | undefined>(undefined)

export function EventLogProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  React.useEffect(() => {
    console.log('account', account)
    if (!account?.address || !account.contractAddress) return
    const eventLog = container.eventLogContainer.eventLog
    const eventBus = container.eventBus
    const meetingAddress = CONTRACT_ADDRESSES.meeting
    const factoryAddress = CONTRACT_ADDRESSES.factory
    console.log('eventLogs', account.address, [
      account.contractAddress,
      meetingAddress,
      factoryAddress
    ])
    eventLog.registerEvent(account.address, [
      account.contractAddress,
      meetingAddress,
      factoryAddress
    ])

    const offMessageReceived = eventLog.on('MessageReceived', (data) => {
      console.log('eventLog MessageReceived event:', data)
      if (data.sender === account.contractAddress) return
      eventBus.emit('message.received', { ...data, type: 'p2p' })
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
    //GROUP
    const offMessageSentGroup = eventLog.on('MessageSentGroup', (data) => {
      eventBus.emit('message.received', {
        ...data,
        recipient: data.groupAddress,
        type: 'group'
      })
    })

    const offMessageEditedGroup = eventLog.on('MessageEditedGroup', (data) => {
      console.log('thanhduy - MessageEditedGroup', data)
      eventBus.emit('message.editGroup', data)
    })

    const offMessageDeletedGroup = eventLog.on('MessageDeletedGroup', (data) => {
      eventBus.emit('message.deleteGroup', data)
    })

    const offMessageReactedGroup = eventLog.on('MessageReactedGroup', (data) => {
      eventBus.emit('reaction.group', data)
    })

    return () => {
      offMessageReceived()
      offReaction()
      offPartnerMessageEdited()
      offPartnerMessageDeleted()
      offDataChannel()
      offGroupCreated()
      offCallReceived()
      offMessageSentGroup()
      offMessageEditedGroup()
      offMessageDeletedGroup()
      offMessageReactedGroup()
    }
  }, [account?.address, account?.contractAddress])

  return <EventLogContext.Provider value={{}}>{children}</EventLogContext.Provider>
}

export function useEventLog() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
