import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { GROUP_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { queryOptions } from '@tanstack/react-query'

export const createAliasQuery = (conversationId: string) =>
  queryOptions({
    queryKey: GROUP_QUERY_KEY.alias(conversationId),
    retry: 0,
    staleTime: Infinity,
    queryFn: async () => {
      const account = await getCurrentAccount()

      return container.anonymousGroupContract.getAliasMember({
        from: account.hiddenAddress,
        to: conversationId
      })
    }
  })

export function getAlias(conversationId: string) {
  return queryClient.ensureQueryData(createAliasQuery(conversationId))
}
