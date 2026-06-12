import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { queryOptions } from '@tanstack/react-query'

export const conversationQuery = (base: BaseConversation) =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.detail(base.id)
  })

// export function setConversation(id: string, input: Partial<FullConversation>) {}
