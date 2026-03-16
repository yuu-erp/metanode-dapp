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

    const array = [
      formatAddress(account.contractAddress),
      formatAddress(meetingAddress),
      formatAddress(factoryAddress)
    ]
    eventLog.registerEvent(formatAddress(account.hiddenAddress), array)

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

    const offCallReceived = eventLog.on('CallReceived', (data) => {
      console.log('eventLog CallReceived event:', {
        data,
        account
      })
      eventBus.emit('call.received', {
        address: account.address,
        callee: data.callee,
        caller: data.caller,
        isCaller: formatAddress(data.caller) === formatAddress(account.address),
        isMeet: false,
        roomId: data.roomId
      })
    })

    const offMessageSent = eventLog.on('MessageSent', async (data) => {
      const message = await container.messageService.decryptMessageForP2p(account, {
        encryptedContent: data.encryptedContent,
        sender: data.sender,
        messageId: data.messageId,
        recipient: data.recipient,
        isMine: true
      })

      eventBus.emit('message.send.bua', {
        conversationId: data.recipient,
        conversationType: 'p2p',
        message: { ...message, status: 'delivered' },
        isMine: true
      })
    })

    const offMessageReceived = eventLog.on('MessageReceived', async (data) => {
      if (formatAddress(account.contractAddress) === formatAddress(data.sender)) return

      eventBus.emit('noti:add', { type: 'message' })
      const message = await container.messageService.decryptMessageForP2p(account, {
        encryptedContent: data.encryptedContent,
        sender: data.sender,
        messageId: data.messageId,
        recipient: data.recipient,
        isMine: false
      })
      eventBus.emit('message.add', {
        conversationId: data.sender,
        conversationType: 'p2p',
        message: { ...message, status: 'delivered' },
        isMine: false
      })
    })

    //GROUP
    const offMessageSentGroup = eventLog.on('MessageSentGroup', async (data) => {
      eventBus.emit('noti:add', { type: 'message' })
      const isMine = formatAddress(data.sender) === formatAddress(account.address)

      const message = await container.messageService.decryptMessageFromGroup(account, {
        encryptedContent: data.encryptedContent,
        groupAddress: data.groupAddress,
        messageId: data.messageId,
        type: 'group',
        sender: formatAddress(data.sender),
        isMine
      })
      const payload: any = {
        conversationId: data.groupAddress,
        conversationType: 'group',
        message: { ...message, status: 'delivered' },
        isMine
      }

      if (isMine) {
        eventBus.emit('message.send.bua', payload)
      } else {
        eventBus.emit('message.receive.bua', payload)
      }
    })

    const offMessageSentAnonymousGroup = eventLog.on('AnonymousMessageStored', async (data) => {
      eventBus.emit('noti:add', { type: 'message' })

      const myAlias = await container.anonymousGroupContract.getAliasMember({
        from: account.address,
        to: data.group
      })

      const message = await container.messageService.decryptMessageFromGroup(account, {
        encryptedContent: data.content,
        groupAddress: data.group,
        messageId: data.messageId,
        type: 'anonymous_group',
        isMine: myAlias === data.sender,
        sender: data.sender
      })
      const isMine = myAlias === data.sender

      const payload = {
        conversationId: data.group,
        conversationType: 'group',
        message: { ...message, status: 'delivered' },
        isMine
      } as any
      if (isMine) {
        eventBus.emit('message.send.bua', payload)
      } else {
        eventBus.emit('message.receive.bua', payload)
      }
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
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: data.groupAddress,
        messageId: data.messageId,
        reactor: data.reactor,
        emoji: data.reaction,
        accountId: account.address,
        isMine: data.reactor === account.address
      })
    })

    const offMessageReactedAnonymousGroup = eventLog.on('MessageReactedAnonymous', (data) => {
      if (formatAddress(account.address) === formatAddress(data.reactor)) return
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: data.group,
        messageId: data.messageId,
        reactor: data.reactor,
        emoji: data.reaction,
        accountId: account.address,
        isMine: false
      })
    })

    const offGroupJoined = eventLog.on('GroupJoined', (data) => {
      eventBus.emit('group.joined', {
        contractAddress: data.groupContractAddress,
        conversationType: 'group'
      })
    })

    const offJoinCommunityGroup = eventLog.on('JoinCommunityGroup', (data) => {
      eventBus.emit('group.joined', {
        contractAddress: data.group,
        conversationType: 'anonymous_group'
      })
    })

    const offPartnerMessageUnReacted = eventLog.on('PartnerMessageUnReacted', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: data.sender,
        messageId: data.messageId,
        reactor: data.reactor
      })
    })

    const offMessageUnReactedGroup = eventLog.on('MessageUnReactedGroup', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: formatAddress(data.groupAddress),
        messageId: data.messageId,
        reactor: formatAddress(data.reactor)
      })
    })

    const offMessageUnReactedAnonymous = eventLog.on('MessageUnReactedAnonymous', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: formatAddress(data.group),
        messageId: data.messageId,
        reactor: formatAddress(data.reactor)
      })
    })

    const offContactAdded = eventLog.on('ContactAdded', () => {
      eventBus.emit('user.added', null)
    })

    const offMessageDeleted = eventLog.on('MessageDeleted', (data) => {
      console.log('thanhduy - offMessageDeleted', data)
      // eventBus.emit('user.added', null)
    })

    // on reaction
    const offMessageReacted = eventLog.on('MessageReacted', (data) => {
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: data.recipient,
        messageId: data.messageId,
        reactor: data.reactor,
        emoji: data.reaction,
        accountId: account.address,
        isMine: true
      })
    })
    const offReaction = eventLog.on('PartnerMessageReacted', (data) => {
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: data.reactor,
        messageId: data.messageId,
        reactor: data.reactor,
        emoji: data.reaction,
        accountId: account.address,
        isMine: false
      })
    })

    const offMessageUnReacted = eventLog.on('MessageUnReacted', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: data.recipient,
        messageId: data.messageId,
        reactor: data.reactor
      })
    })

    const offMessageReadByPartner = eventLog.on('MessageReadByPartner', (data) => {
      eventBus.emit('message.read', {
        ids: [data.messageId],
        accountId: account.address,
        conversationId: data.reader
      })
    })

    const offMessageRead = eventLog.on('MessageRead', (data) => {
      eventBus.emit('message.read', {
        ids: [data.messageId],
        accountId: account.address,
        conversationId: data.groupAddress
      })
    })

    const offMessageReadAnonymous = eventLog.on('MessageReadAnonymous', (data) => {
      eventBus.emit('message.read', {
        ids: [data.messageId],
        accountId: account.address,
        conversationId: data.group
      })
    })

    const off = eventLog.onEventLog((data) => {
      console.log('thanhduy - event log data', data)
    })

    return () => {
      offMessageReadAnonymous()
      offMessageRead()
      offMessageReadByPartner()
      offContactAdded()
      offMessageReceived()
      offReaction()
      offPartnerMessageEdited()
      offPartnerMessageDeleted()
      offDataChannel()
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
      offPartnerMessageUnReacted()
      offMessageUnReacted()
      offMessageUnReactedGroup()
      offMessageUnReactedAnonymous()
      offMessageSent()
      offMessageDeleted()
      offMessageReacted()
      off()
    }
  }, [account?.address, account?.contractAddress])

  React.useEffect(() => {
    container.eventLogContainer.registerAbi()
  }, [])

  return <EventLogContext.Provider value={{}}>{children}</EventLogContext.Provider>
}

export function useEventLog() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
