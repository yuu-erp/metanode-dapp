import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { Account } from '@/modules/account'
import { queryOptions } from '@tanstack/react-query'
import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'

export const createConversationKeyQuery = (input: BaseConversation, account: Account) =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.key(input.id),
    enabled: !!input.id,
    queryFn: () => container.conversationService.getConversationKey(input, account),
    staleTime: Infinity
  })

export async function getConversationKey(input: BaseConversation) {
  const account = await getCurrentAccount()
  return queryClient.ensureQueryData(createConversationKeyQuery(input, account))
}
