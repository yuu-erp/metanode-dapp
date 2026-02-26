'use client'

import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import { formatAddress } from '@/shared/utils'
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
    const meetingAddress = CONTRACT_ADDRESSES.meeting
    const factoryAddress = CONTRACT_ADDRESSES.factory

    eventLog.registerEvent(account.address, [
      account.contractAddress,
      meetingAddress,
      factoryAddress
    ])

    const offMessageReceived = eventLog.on('MessageReceived', (data) => {
      if (data.sender === account.contractAddress) return

      eventBus.emit('message.received', { ...data, type: 'p2p' })
      eventBus.emit('noti:add', { type: 'message' })
    })

    const offReaction = eventLog.on('PartnerMessageReacted', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('noti:add', { type: 'reaction' })
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
      if (formatAddress(account.address) === formatAddress(data.sender)) return
      eventBus.emit('noti:add', { type: 'message' })
      eventBus.emit('message.received', {
        ...data,
        recipient: data.groupAddress,
        type: 'group'
      })
    })

    const offMessageSentAnonymousGroup = eventLog.on('AnonymousMessageStored', (data) => {
      if (formatAddress(account.address) === formatAddress(data.sender)) return
      eventBus.emit('noti:add', { type: 'message' })
      eventBus.emit('message.received', {
        sender: data.sender,
        recipient: data.group,
        messageId: data.messageId,
        encryptedContent: data.content,
        type: 'anonymous_group'
      })
    })

    const offMessageEditedGroup = eventLog.on('MessageEditedGroup', (data) => {
      eventBus.emit('message.editGroup', {
        groupAddress: data.groupAddress,
        messageId: data.messageId,
        newContent: data.newContent,
        type: 'group'
      })
    })

    const offMessageEditedAnonymousGroup = eventLog.on('MessageEditedAnonymous', (data) => {
      eventBus.emit('message.editGroup', {
        groupAddress: data.groupAddress,
        messageId: data.messageId,
        newContent: data.newEncryptedContent,
        type: 'anonymous_group'
      })
    })

    const offMessageDeletedGroup = eventLog.on('MessageDeletedGroup', (data) => {
      eventBus.emit('message.deleteGroup', {
        groupAddress: data.groupAddress,
        messageId: data.messageId,
        type: 'group'
      })
    })

    const offMessageDeletedAnonymousGroup = eventLog.on('MessageDeletedAnonymous', (data) => {
      eventBus.emit('message.deleteGroup', {
        groupAddress: data.groupAddress,
        messageId: data.messageId,
        type: 'anonymous_group'
      })
    })

    const offMessageReactedGroup = eventLog.on('MessageReactedGroup', (data) => {
      if (formatAddress(account.address) === formatAddress(data.reactor)) return
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.group', {
        groupAddress: data.groupAddress,
        messageId: data.messageId,
        reaction: data.reaction,
        reactor: data.reactor,
        type: 'group'
      })
    })

    const offMessageReactedAnonymousGroup = eventLog.on('MessageReactedAnonymous', (data) => {
      if (formatAddress(account.address) === formatAddress(data.reactor)) return
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.group', {
        groupAddress: data.group,
        messageId: data.messageId,
        reaction: data.reaction,
        reactor: data.reactor,
        type: 'anonymous_group'
      })
    })

    const offGroupJoined = eventLog.on('GroupJoined', (data) => {
      eventBus.emit('group.joined', { contractAddress: data.groupContractAddress })
    })

    const offJoinCommunityGroup = eventLog.on('JoinCommunityGroup', (data) => {
      eventBus.emit('group.joined', { contractAddress: data.group })
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
      offMessageSentAnonymousGroup()
      offMessageEditedAnonymousGroup()
      offMessageDeletedAnonymousGroup()
      offMessageReactedAnonymousGroup()
      offGroupJoined()
      offJoinCommunityGroup()
    }
  }, [account?.address, account?.contractAddress])

  return <EventLogContext.Provider value={{}}>{children}</EventLogContext.Provider>
}

export function useEventLog() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
