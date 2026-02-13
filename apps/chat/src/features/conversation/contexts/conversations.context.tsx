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

  const onConversationReceived = React.useCallback(
    async (event: AppEvents['message.received']) => {
      if (!account) return
      const messageService = container.messageService

      try {
        let message

        if (event.type === 'group') {
          message = await messageService.decryptMessageFromGroup(account, {
            messageId: event.messageId,
            encryptedContent: event.encryptedContent,
            groupAddress: event.recipient
          })
        } else {
          message = await messageService.decryptMessageFromPartner(account, {
            encryptedContent: event.encryptedContent,
            sender: event.sender,
            messageId: event.messageId,
            recipient: event.recipient
          })
        }

        if (message) {
          await handleUpdateConversation(message)
        }
      } catch (error) {
        console.error('[ConversationsProvider] Error decrypting message:', error)
      }
    },
    [account, handleUpdateConversation]
  )

  const onMessageCreate = React.useCallback(
    async (event: AppEvents['message.create']) => {
      if (!account) return
      // event.message is the optimistic message (PersistedMessage compatible)
      await handleUpdateConversation(event.message)
    },
    [account, handleUpdateConversation]
  )

  React.useEffect(() => {
    if (!account) return
    const eventBus = container.eventBus
    eventBus.on('message.received', onConversationReceived)
    eventBus.on('message.create', onMessageCreate)

    return () => {
      eventBus.off('message.received', onConversationReceived)
      eventBus.off('message.create', onMessageCreate)
    }
  }, [account, onConversationReceived, onMessageCreate])
  return <ConversationsContext.Provider value={{}}>{children}</ConversationsContext.Provider>
}

export function useConversations() {
  const ctx = React.useContext(ConversationsContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider')
  return ctx
}
