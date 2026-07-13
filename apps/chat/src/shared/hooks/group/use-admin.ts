import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { GROUP_QUERY_KEY } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { useAddress } from '../accounts/use-address'
import { useConversationParams } from '../use-conversation-params'

export const createAdminQuery = (conversationId: string, type: ConversationType, from: string) =>
  queryOptions({
    queryKey: GROUP_QUERY_KEY.ADMIN(conversationId),
    queryFn: async () => {
      switch (type) {
        case 'group':
          return await container.groupContract.admin({
            from: from,
            to: conversationId
          })
        case 'anonymous_group':
          return await container.anonymousGroupContract.admin({
            from: from,
            to: conversationId
          })
        default:
          throw new Error('Invalid conversation type')
      }
    },
    enabled: !!from && !!conversationId && !!type,
    staleTime: 1000 * 60 * 5
  })

export function useAdmin() {
  const { id, type } = useConversationParams()
  const { address, hiddenAddress } = useAddress()
  const query = useQuery(createAdminQuery(id, type, hiddenAddress))
  return { ...query, isAdmin: query.data === address }
}
