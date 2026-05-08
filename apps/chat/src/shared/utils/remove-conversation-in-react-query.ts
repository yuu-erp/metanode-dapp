import type { Conversation } from '@/modules/conversation'
import { CONVERSATION_QUERY_KEY, queryClient } from '../lib/react-query'

export function removeConversationInReactQuery(address: string, conversationId?: string) {
  const key = CONVERSATION_QUERY_KEY.CONVERSATIONS(address)
  const list: Conversation[] = queryClient.getQueryData(key) ?? []
  queryClient.setQueryData(
    key,
    list.filter((i) => i.conversationId !== conversationId)
  )
}
