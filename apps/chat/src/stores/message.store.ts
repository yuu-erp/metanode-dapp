import { create } from 'zustand'

export type MessageItem = {
  id: string
  content?: any
  filePath?: string
  mimeType?: string
  isMine?: boolean
  status?: string
}

export type MessageStore = {
  messages: Record<string, MessageItem>
  setMessage: (id: string, value: Partial<MessageItem>) => void
}

function ensureStatusPriority(old?: string, _new?: string) {
  const priorities = ['failed', 'read', 'delivered', 'sending']
  return priorities.find((status) => old === status || _new === status)
}

export const useMessageStore = create<MessageStore>()((set) => ({
  messages: {},
  setMessage: (id, value) => {
    set((s) => {
      const { messages } = s
      let oldMessage = messages[id]

      const newMessage: MessageItem = {
        ...oldMessage,
        ...value,
        status: ensureStatusPriority(oldMessage?.status, value?.status)
      }
      const newId = value.id ?? id
      return { messages: { ...messages, [newId]: newMessage } }
    })
  }
}))

export const messageActions = useMessageStore.getState()
