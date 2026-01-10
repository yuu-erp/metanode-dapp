'use client'
import { container } from '@/container'
import { useCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY, MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import * as React from 'react'
import { createContext, useContext } from 'react'

export interface EventLogState {}

const EventLogContext = createContext<EventLogState | undefined>(undefined)

interface EventLogProviderProps extends React.PropsWithChildren {}

export function EventLogProvider({ children }: EventLogProviderProps) {
  const { data: currentAccount } = useCurrentAccount()
  React.useEffect(() => {
    if (!currentAccount) return
    const eventLog = container.eventLogContainer.eventLog
    eventLog.registerEvent(currentAccount.address, [currentAccount.contractAddress])
    const unsubscribe = eventLog.on('MessageReceived', async (data) => {
      const conversationService = container.conversationService
      await conversationService.updateConversation(
        currentAccount,
        data.sender,
        data.encryptedContent
      )
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(currentAccount.address)
      })
      queryClient.invalidateQueries({
        queryKey: MESSAGE_QUERY_KEY.MESSAGES(currentAccount.address, data.sender)
      })
    })
    return () => unsubscribe()
  }, [currentAccount])
  return <EventLogContext.Provider value={{}}>{children}</EventLogContext.Provider>
}

export function useEventLog() {
  const context = useContext(EventLogContext)
  if (context === undefined) {
    throw new Error('useEventLog must be used within an EventLogProvider')
  }
  return context
}
