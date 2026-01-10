'use client'
import { container } from '@/container'
import type { Message, MessageStatus } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
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
  clientId: string,
  updater: (msg: Message) => Message
) {
  const queryKey = MESSAGE_QUERY_KEY.MESSAGES(accountId, conversationId)

  queryClient.setQueryData<InfiniteData<Message[]>>(queryKey, (oldData) => {
    if (!oldData) return oldData

    let found = false

    const pages: Message[][] = oldData.pages.map((page) =>
      page.map((msg) => {
        if (msg.clientId === clientId) {
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

  const onMessageSent = React.useCallback((event: AppEvents['message.sent']) => {
    updateMessageInInfiniteCache(event.accountId, event.conversationId, event.clientId, (msg) => ({
      ...msg,
      messageId: event.messageId,
      status: 'delivered' as MessageStatus
    }))
  }, [])

  const onMessageStatus = React.useCallback((event: AppEvents['message.status']) => {
    updateMessageInInfiniteCache(event.accountId, event.conversationId, event.clientId, (msg) => ({
      ...msg,
      status: event.status,
      ...(event.messageId ? { messageId: event.messageId } : {})
    }))
  }, [])

  React.useEffect(() => {
    if (!account) return
    const eventBus = container.eventBus
    eventBus.on('message.create', onMessageCreate)
    eventBus.on('message.sent', onMessageSent)
    eventBus.on('message.status', onMessageStatus)
    return () => {
      eventBus.off('message.create', onMessageCreate)
      eventBus.off('message.sent', onMessageSent)
      eventBus.off('message.status', onMessageStatus)
    }
  }, [account, onMessageCreate, onMessageSent, onMessageStatus])
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
