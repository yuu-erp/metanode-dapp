'use client'
import { container } from '@/container'
import { decodeBase64, encodeBase64, type Message, type MessageStatus } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY, MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { AppEvents } from '@/types/app-events'
import type { InfiniteData } from '@tanstack/react-query'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventBusSendMessageState {}

const EventBusSendMessageContext = createContext<EventBusSendMessageState | undefined>(undefined)

interface EventBusSendMessageProviderProps extends React.PropsWithChildren {}

function updateMessageInInfiniteCache(
  accountId: string,
  conversationId: string,
  messageId: string,
  updater: (msg: Message) => Message
) {
  const queryKey = MESSAGE_QUERY_KEY.MESSAGES(accountId, conversationId)

  queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (oldData) => {
    if (!oldData) return oldData

    let found = false

    const pages: Message[][] = oldData.pages.map((page) =>
      page.map((msg) => {
        if (msg.clientId === messageId || msg.id === messageId) {
          found = true
          return updater(msg)
        }
        return msg
      })
    )

    if (!found) return oldData

    return {
      pages,
      pageParams: oldData.pageParams
    }
  })
}

export function EventBusSendMessageProvider({ children }: EventBusSendMessageProviderProps) {
  const { data: account } = useCurrentAccount()

  const onMessageCreate = React.useCallback((event: AppEvents['message.create']) => {
    const { message } = event

    const queryKey = MESSAGE_QUERY_KEY.MESSAGES(message.accountId, message.conversationId)

    queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (oldData) => {
      if (!oldData) return oldData

      return {
        ...oldData,
        pages: [[message, ...(oldData.pages[0] ?? [])], ...oldData.pages.slice(1)]
      }
    })
  }, [])

  const onMessageSent = React.useCallback(async (event: AppEvents['message.sent']) => {
    console.log('[EVENT BUS] - ON MESSAGE SENT', event)
    if (!account) return
    updateMessageInInfiniteCache(event.accountId, event.conversationId, event.clientId, (msg) => ({
      ...msg,
      messageId: event.messageId,
      status: 'delivered' as MessageStatus
    }))
    const conversationService = container.conversationService
    await conversationService.updateConversation(
      account,
      event.conversationId,
      event.encryptContent
    )
    queryClient.invalidateQueries({
      queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
    })
  }, [])

  const onMessageStatus = React.useCallback((event: AppEvents['message.status']) => {
    updateMessageInInfiniteCache(event.accountId, event.conversationId, event.clientId, (msg) => ({
      ...msg,
      status: event.status,
      ...(event.messageId ? { messageId: event.messageId } : {})
    }))
  }, [])

  const onMessageReceived = React.useCallback(
    async (event: AppEvents['message:received']) => {
      console.log('[onMessageReceived] event:', event)
      if (!account) return

      try {
        const messageService = container.messageService

        const message = await messageService.messageReceived(account, event)
        console.log('[onMessageReceived] message:', message)

        const queryKey = MESSAGE_QUERY_KEY.MESSAGES(message.accountId, message.conversationId)

        queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: [[message, ...(oldData.pages[0] ?? [])], ...oldData.pages.slice(1)]
          }
        })

        queryClient.invalidateQueries({
          queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
        })
      } catch (error) {
        console.error('[onMessageReceived] FAILED', error)
      }
    },
    [account]
  )

  const onMessageReactionReceived = React.useCallback(
    (event: AppEvents['message.reaction.received']) => {
      if (!account) return

      const { messageId, reaction: emoji, reactor, sender, recipient } = event

      // xác định conversationId
      const conversationId = sender === account.contractAddress ? recipient : sender

      updateMessageInInfiniteCache(account.address, conversationId, messageId, (msg) => {
        const reactions = [...(msg.reactions ?? [])]
        const existingIndex = reactions.findIndex((r) => encodeBase64(r.emoji) === emoji)
        const isMe = reactor === account.contractAddress

        if (existingIndex >= 0) {
          const existing = reactions[existingIndex]

          // tránh tăng trùng nếu đã tồn tại
          const users = existing.users ?? []
          const alreadyReacted = users.includes(reactor)

          reactions[existingIndex] = {
            ...existing,
            count: alreadyReacted ? existing.count : existing.count + 1,
            reactedByMe: existing.reactedByMe || isMe,
            users: existing.users ? (alreadyReacted ? users : [...users, reactor]) : undefined
          }
        } else {
          reactions.push({
            emoji: decodeBase64(emoji),
            count: 1,
            reactedByMe: isMe,
            users: [reactor]
          })
        }

        return {
          ...msg,
          reactions
        }
      })
    },
    [account]
  )

  React.useEffect(() => {
    if (!account) return
    const eventBus = container.eventBus
    eventBus.on('message.create', onMessageCreate)
    eventBus.on('message.sent', onMessageSent)
    eventBus.on('message.status', onMessageStatus)
    eventBus.on('message:received', onMessageReceived)
    eventBus.on('message.reaction.received', onMessageReactionReceived)
    return () => {
      eventBus.off('message.create', onMessageCreate)
      eventBus.off('message.sent', onMessageSent)
      eventBus.off('message.status', onMessageStatus)
      eventBus.off('message:received', onMessageReceived)
      eventBus.off('message.reaction.received', onMessageReactionReceived)
    }
  }, [
    account,
    onMessageCreate,
    onMessageSent,
    onMessageStatus,
    onMessageReceived,
    onMessageReactionReceived
  ])
  return (
    <EventBusSendMessageContext.Provider value={{}}>{children}</EventBusSendMessageContext.Provider>
  )
}

export function useEventBusSendMessage() {
  const context = useContext(EventBusSendMessageContext)
  if (context === undefined) {
    throw new Error('useEventBusSendMessage must be used within an EventBusSendMessageProvider')
  }
  return context
}
