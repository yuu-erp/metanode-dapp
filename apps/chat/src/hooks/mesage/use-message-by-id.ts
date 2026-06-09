import { useMessageStore, type MessageItem } from '@/stores/message.store'
import { useShallow } from 'zustand/shallow'

export function useMessageById<T = MessageItem>(
  id: string,
  selector?: (input: MessageItem) => T
): T {
  return useMessageStore(
    useShallow((s) => {
      const m = s.messages[id]
      return selector && m ? selector(m) : (m as T)
    })
  )
}
