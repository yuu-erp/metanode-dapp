'use client'
import type { Message } from '@/modules/message'
import * as React from 'react'
import { createContext, useContext } from 'react'

export type MessageActionType = 'EDIT' | 'REPLY'

export interface MessageAction {
  type: MessageActionType
  message: Message
}

export interface MessageActionState {
  messageAction: MessageAction | null
  setMessageAction: React.Dispatch<MessageAction | null>
}

const MessageActionContext = createContext<MessageActionState | undefined>(undefined)

interface MessageActionProviderProps extends React.PropsWithChildren {}

export function MessageActionProvider({ children }: MessageActionProviderProps) {
  const [messageAction, setMessageAction] = React.useState<MessageAction | null>(null)

  return (
    <MessageActionContext.Provider value={{ messageAction, setMessageAction }}>
      {children}
    </MessageActionContext.Provider>
  )
}

export function useMessageAction() {
  const context = useContext(MessageActionContext)
  if (context === undefined) {
    throw new Error('useMessageAction must be used within an MessageActionProvider')
  }
  return context
}
