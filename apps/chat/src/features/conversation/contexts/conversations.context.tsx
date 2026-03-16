'use client'
import { container } from '@/container'
import type { Message } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { AppEvents } from '@/types/app-events'
import * as React from 'react'

export interface ConversationsState {}

const ConversationsContext = React.createContext<ConversationsState | undefined>(undefined)

export function ConversationsProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  const handleUpdateConversation = React.useCallback(
    async (message: Message) => {
      // TODO: Define specific event type if possible or use generic payload
      if (!account) return
      const conversationService = container.conversationService

      // Ensure message is fully typed PersistedMessage
      // If message comes from 'message.sent', it might be optimistic or confirmed.
      // If it comes from 'message.received', we need to decrypt first.
      await conversationService.updateWithLastMessage(message)

      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
      })
    },
    [account]
  )

  const onMessageCreate = React.useCallback(
    async (event: AppEvents['message.create']) => {
      if (!account) return
      // event.message is the optimistic message (PersistedMessage compatible)
      await handleUpdateConversation(event.message)
    },
    [account, handleUpdateConversation]
  )

  const syncConversations = React.useCallback(async () => {
    if (!account) return
    await container.conversationService.syncByAccount(account)
    queryClient.invalidateQueries({
      queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
    })
  }, [account, queryClient, container])

  const onMessageUpsert = React.useCallback(
    (e: AppEvents['message.add']) => {
      handleUpdateConversation(e.message)
    },
    [account, handleUpdateConversation]
  )

  React.useEffect(() => {
    if (!account) return
    const eventBus = container.eventBus
    eventBus.on('group.joined', syncConversations)
    eventBus.on('user.added', syncConversations)
    eventBus.on('message.add', onMessageUpsert)

    return () => {
      eventBus.off('group.joined', syncConversations)
      eventBus.on('user.added', syncConversations)
      eventBus.off('message.add', syncConversations)
    }
  }, [account, onMessageCreate, syncConversations])
  return <ConversationsContext.Provider value={{}}>{children}</ConversationsContext.Provider>
}

export function useConversations() {
  const ctx = React.useContext(ConversationsContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider')
  return ctx
}
