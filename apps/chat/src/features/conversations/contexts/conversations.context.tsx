'use client'
import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { AppEvents } from '@/types/app-events'
import * as React from 'react'

export interface ConversationsState {}

const ConversationsContext = React.createContext<ConversationsState | undefined>(undefined)

export function ConversationsProvider({ children }: React.PropsWithChildren) {
  const { data: account } = useCurrentAccount()

  const onConversationReceived = React.useCallback(
    async (event: AppEvents['message.received']) => {
      console.log('[CONVERSATIONS PROVIDER] ---- onConversationReceived -- event ---', event)
      if (!account) return
      const conversationService = container.conversationService
      await conversationService.updateConversation(account, event.sender, event.encryptedContent)
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
      })
    },
    [account]
  )

  React.useEffect(() => {
    if (!account) return
    const eventBus = container.eventBus
    eventBus.on('message.received', onConversationReceived)
    return () => {
      eventBus.off('message.received', onConversationReceived)
    }
  }, [account])
  return <ConversationsContext.Provider value={{}}>{children}</ConversationsContext.Provider>
}

export function useConversations() {
  const ctx = React.useContext(ConversationsContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider')
  return ctx
}
