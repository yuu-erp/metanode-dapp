'use client'
import { container } from '@/container'
import type { Message } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { AppEvents } from '@/types/app-events'
import type { InfiniteData } from '@tanstack/react-query'
import * as React from 'react'
import {
  applyMessageSent,
  applyReactionCreate,
  applyReactionReceived,
  insertMessage,
  updateMessageStatus
} from '../message-cache.utils'

export interface MessageState {}

const MessageContext = React.createContext<MessageState | undefined>(undefined)

export function MessageProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  const onMessageReceived = React.useCallback(
    async (event: AppEvents['message.received']) => {
      console.log('[MESSAGE PROVIDER] ---- onMessageReceived -- event ---', event)
      if (!account) return
      const messageService = container.messageService
      const message = await messageService.messageReceived(account, event)
      queryClient.setQueryData<InfiniteData<Message[]>>(
        MESSAGE_QUERY_KEY.MESSAGES(account!.address, message.conversationId),
        (old) => insertMessage(old, message)
      )
    },
    [account]
  )

  const onMessageCreated = React.useCallback(async (event: AppEvents['message.create']) => {
    console.log('[MESSAGE PROVIDER] ---- onMessageCreated -- event ---', event)
    const message = event.message
    queryClient.setQueryData<InfiniteData<Message[]>>(
      MESSAGE_QUERY_KEY.MESSAGES(message.accountId, message.conversationId),
      (old) => insertMessage(old, message)
    )
  }, [])

  const onMessageStatus = React.useCallback(
    (event: AppEvents['message.status']) => {
      console.log('[MESSAGE PROVIDER] ---- onMessageStatus -- event ---', event)

      if (!account) return

      const queryKey = MESSAGE_QUERY_KEY.MESSAGES(event.accountId, event.conversationId)

      queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (old) =>
        updateMessageStatus(old, {
          messageId: event.messageId,
          clientId: event.clientId,
          status: event.status
        })
      )
    },
    [account]
  )

  const onMessageSent = React.useCallback(
    (event: AppEvents['message.sent']) => {
      console.log('[MESSAGE PROVIDER] ---- onMessageSent -- event ---', event)

      if (!account) return

      queryClient.setQueryData<InfiniteData<Message[]>>(
        MESSAGE_QUERY_KEY.MESSAGES(event.accountId, event.conversationId),
        (old) =>
          applyMessageSent(old, {
            clientId: event.clientId,
            messageId: event.messageId
          })
      )
    },
    [account]
  )

  const onReactionReceived = React.useCallback(
    (event: AppEvents['reaction.received']) => {
      console.log('[MESSAGE PROVIDER] ---- onReactionReceived ---', event)

      if (!account) return

      queryClient.setQueryData<InfiniteData<Message[]>>(
        MESSAGE_QUERY_KEY.MESSAGES(
          account.address,
          event.sender // conversationId = sender
        ),
        (old) =>
          applyReactionReceived(old, {
            messageId: event.messageId,
            encodedEmoji: event.reaction,
            reactedByMe: event.reactor === account.contractAddress
          })
      )
    },
    [account]
  )

  const onReactionCreate = React.useCallback((event: AppEvents['reaction.create']) => {
    console.log('[MESSAGE PROVIDER] ---- onReactionCreate ---', event)

    queryClient.setQueryData<InfiniteData<Message[]>>(
      MESSAGE_QUERY_KEY.MESSAGES(event.accountId, event.conversationId),
      (old) =>
        applyReactionCreate(old, {
          messageId: event.messageId,
          emoji: event.emoji
        })
    )
  }, [])

  React.useEffect(() => {
    if (!account) return
    const eventBus = container.eventBus
    eventBus.on('message.received', onMessageReceived)
    eventBus.on('message.create', onMessageCreated)
    eventBus.on('message.status', onMessageStatus)
    eventBus.on('message.sent', onMessageSent)
    eventBus.on('reaction.received', onReactionReceived)
    eventBus.on('reaction.create', onReactionCreate)
    return () => {
      eventBus.off('message.received', onMessageReceived)
      eventBus.off('message.create', onMessageCreated)
      eventBus.off('message.status', onMessageStatus)
      eventBus.off('message.sent', onMessageSent)
      eventBus.off('reaction.received', onReactionReceived)
      eventBus.off('reaction.create', onReactionCreate)
    }
  }, [account, onMessageReceived, onMessageCreated, onMessageStatus, onMessageSent])

  return <MessageContext.Provider value={{}}>{children}</MessageContext.Provider>
}

export function useMessage() {
  const ctx = React.useContext(MessageContext)
  if (!ctx) throw new Error('useMessage must be used within MessageProvider')
  return ctx
}
