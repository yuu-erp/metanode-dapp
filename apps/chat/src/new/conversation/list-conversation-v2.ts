import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const createConversationListQuery = () =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.list,
    queryFn: async () => {
      console.log('createConversationListQuery 1')
      const account = await getCurrentAccount()
      const rs = await container.userContract.getFullInbox({
        from: account.hiddenAddress,
        to: account.contractAddress
      })
      console.log('createConversationListQuery 2', rs)
    }
  })

export function useConversationList() {
  return useQuery(createConversationListQuery())
}
