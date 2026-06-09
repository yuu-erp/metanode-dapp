'use client'

import { CONTRACT_ADDRESSES } from '@/config'
import { container } from '@/container'
import { pushNoti } from '@/modules/noti'
import { useCurrentAccount } from '@/shared/hooks'
import { getUser } from '@/shared/hooks/conversations/use-user-by-address'
import { compareAddress } from '@/shared/lib'
import { formatAddress } from '@/shared/utils'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventLogState {}

const EventLogContext = createContext<EventLogState | undefined>(undefined)

const formatObj = (obj: object) => {
  const newObj: any = {}
  for (const key in obj) {
    newObj[key] = formatAddress(obj[key])
  }

  return newObj
}

export function EventLogProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  const [load, setLoad] = React.useState(false)

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
    console.log('array', array)
    eventLog.registerEvent(formatAddress(account.hiddenAddress), array)

    const offPartnerMessageEdited = eventLog.on('PartnerMessageEdited', (data) => {
      if (data.sender === account.contractAddress) return
      // eventBus.emit('message.partneredited', data)
    })

    const offPartnerMessageDeleted = eventLog.on('PartnerMessageDeleted', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('message.partnerdeleted', formatObj(data))
    })

    const offDataChannel = eventLog.on('DataChannel', (data) => {
      if (data.sender === account.contractAddress) return
      eventBus.emit('webrtc.datachannel.received', formatObj(data))
    })

    const offCallReceived = eventLog.on('CallReceived', async (data) => {
      const callerContractAddress = await container.factoryContract.getUserContract({
        from: account.address,
        inputData: { user: data.owner }
      })

      eventBus.emit('call.received', {
        address: account.address,
        callee: data.callee,
        caller: callerContractAddress,
        isCaller: formatAddress(data.caller) === formatAddress(account.address),
        isMeet: false,
        roomId: data.roomId,
        conversationType: 'p2p'
      })
    })

    const offMessageSent = eventLog.on('MessageSent', async (data) => {
      console.log('[offMessageSent] 1', { data })
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
      console.log('[MessageReceived] data', data)
      console.log('[offMessageReceived]', { data })
      eventBus.emit('noti:add', { type: 'message' })
      const message = await container.messageService.decryptMessageForP2p(account, {
        encryptedContent: data.encryptedContent,
        sender: formatAddress(data.sender),
        messageId: formatAddress(data.messageId),
        recipient: formatAddress(data.recipient),
        isMine: false
      })
      const user = await getUser(account.address, data.sender)
      pushNoti(user?.name ?? 'Chat P2P', message)
      eventBus.emit('message.add', {
        conversationId: formatAddress(data.sender),
        conversationType: 'p2p',
        message: { ...message, status: 'delivered' },
        isMine: false
      })
    })

    //GROUP
    const offMessageSentGroup = eventLog.on('MessageSentGroup', async (data) => {
      const isMine = formatAddress(data.sender) === formatAddress(account.address)
      eventBus.emit('noti:add', { type: 'message' })

      const message = await container.messageService.decryptMessageFromGroup(account, {
        encryptedContent: data.encryptedContent,
        groupAddress: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
        type: 'group',
        sender: formatAddress(data.sender),
        isMine
      })

      const payload: any = {
        conversationId: formatAddress(data.groupAddress),
        conversationType: 'group',
        message: { ...message, status: 'delivered' },
        isMine
      }
      if (isMine) {
        eventBus.emit('message.send.bua', payload)
      } else {
        console.log('message content', message)
        eventBus.emit('message.receive.bua', payload)
        //@ts-ignore
        pushNoti('Chat Group', message)
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
        groupAddress: formatAddress(data.group),
        messageId: formatAddress(data.messageId),
        type: 'anonymous_group',
        isMine: myAlias === data.sender,
        sender: formatAddress(data.sender)
      })
      const isMine = myAlias === data.sender

      const payload = {
        conversationId: formatAddress(data.group),
        conversationType: 'group',
        message: { ...message, status: 'delivered' },
        isMine
      } as any
      if (isMine) {
        eventBus.emit('message.send.bua', payload)
      } else {
        //@ts-ignore
        pushNoti('Chat anonymous group', message)
        eventBus.emit('message.receive.bua', payload)
      }
    })

    const offMessageEditedGroup = eventLog.on('MessageEditedGroup', (data) => {
      eventBus.emit('message.editGroup', {
        groupAddress: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
        newContent: formatAddress(data.newContent),
        type: 'group'
      })
    })

    const offMessageEditedAnonymousGroup = eventLog.on('MessageEditedAnonymous', (data) => {
      eventBus.emit('message.editGroup', {
        groupAddress: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
        newContent: data.newEncryptedContent,
        type: 'anonymous_group'
      })
    })

    const offMessageDeletedGroup = eventLog.on('MessageDeletedGroup', (data) => {
      eventBus.emit('message.deleteGroup', {
        groupAddress: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
        type: 'group'
      })
    })

    const offMessageDeletedAnonymousGroup = eventLog.on('MessageDeletedAnonymous', (data) => {
      eventBus.emit('message.deleteGroup', {
        groupAddress: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
        type: 'anonymous_group'
      })
    })

    const offMessageReactedGroup = eventLog.on('MessageReactedGroup', (data) => {
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
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
        conversationId: formatAddress(data.group),
        messageId: formatAddress(data.messageId),
        reactor: formatAddress(data.reactor),
        emoji: data.reaction,
        accountId: account.address,
        isMine: false
      })
    })

    const offGroupJoined = eventLog.on('GroupJoined', (data) => {
      eventBus.emit('group.joined', {
        contractAddress: formatAddress(data.groupContractAddress),
        conversationType: 'group'
      })
    })

    const offJoinCommunityGroup = eventLog.on('JoinCommunityGroup', (data) => {
      eventBus.emit('group.joined', {
        contractAddress: formatAddress(data.group),
        conversationType: 'anonymous_group'
      })
    })

    const offPartnerMessageUnReacted = eventLog.on('PartnerMessageUnReacted', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: formatAddress(data.sender),
        messageId: formatAddress(data.messageId),
        reactor: data.reactor
      })
    })

    const offMessageUnReactedGroup = eventLog.on('MessageUnReactedGroup', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: formatAddress(data.groupAddress),
        messageId: formatAddress(data.messageId),
        reactor: formatAddress(data.reactor)
      })
    })

    const offMessageUnReactedAnonymous = eventLog.on('MessageUnReactedAnonymous', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: formatAddress(data.group),
        messageId: formatAddress(data.messageId),
        reactor: formatAddress(data.reactor)
      })
    })

    const offContactAdded = eventLog.on('ContactAdded', () => {
      eventBus.emit('user.added', null)
    })

    const offMessageDeleted = eventLog.on('MessageDeleted', () => {
      // eventBus.emit('user.added', null)
    })

    // on reaction
    const offMessageReacted = eventLog.on('MessageReacted', (data) => {
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: formatAddress(data.recipient),
        messageId: formatAddress(data.messageId),
        reactor: formatAddress(data.reactor),
        emoji: data.reaction,
        accountId: account.address,
        isMine: true
      })
    })
    const offReaction = eventLog.on('PartnerMessageReacted', (data) => {
      eventBus.emit('noti:add', { type: 'reaction' })
      eventBus.emit('reaction.upsert', {
        conversationId: formatAddress(data.reactor),
        messageId: formatAddress(data.messageId),
        reactor: formatAddress(data.reactor),
        emoji: data.reaction,
        accountId: account.address,
        isMine: false
      })
    })

    const offMessageUnReacted = eventLog.on('MessageUnReacted', (data) => {
      eventBus.emit('reaction.removed', {
        accountId: account.address,
        conversationId: formatAddress(data.recipient),
        messageId: formatAddress(data.messageId),
        reactor: data.reactor
      })
    })

    const offMessageReadByPartner = eventLog.on('MessageReadByPartner', (data) => {
      const payload = {
        ids: [formatAddress(data.messageId)],
        accountId: account.address,
        conversationId: formatAddress(data.reader)
      }

      eventBus.emit('message.read', payload)
    })

    const offMessageRead = eventLog.on('MessageRead', (data) => {
      eventBus.emit('message.read', {
        ids: [formatAddress(data.messageId)],
        accountId: account.address,
        conversationId: formatAddress(data.groupAddress)
      })
    })

    const offMessageReadAnonymous = eventLog.on('MessageReadAnonymous', (data) => {
      eventBus.emit('message.read', {
        ids: [formatAddress(data.messageId)],
        accountId: account.address,
        conversationId: formatAddress(data.group)
      })
    })

    const offCallReceivedSignal = eventLog.on('CallReceivedSignal', (data) => {
      if (compareAddress(data.caller, account.address)) return
      eventBus.emit('call.received', {
        address: account.address,
        callee: formatAddress(data.callee),
        caller: formatAddress(data.caller),
        isCaller: false,
        isMeet: true,
        roomId: formatAddress(data.roomId),
        conversationType: 'group'
      })
    })

    return () => {
      offCallReceivedSignal()
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
    }
  }, [account?.address, account?.contractAddress])

  React.useEffect(() => {
    Promise.race([
      container.eventLogContainer.registerAbi().catch(),
      new Promise((res) => setTimeout(() => res(true), 2000))
    ]).then(() => setLoad(true))
  }, [])

  return <EventLogContext.Provider value={{}}>{load ? children : null}</EventLogContext.Provider>
}

export function useEventLogContext() {
  const ctx = useContext(EventLogContext)
  if (!ctx) throw new Error('useEventLog must be used within EventLogProvider')
  return ctx
}
