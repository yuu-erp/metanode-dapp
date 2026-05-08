import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { useAddress } from '@/shared/hooks/accounts/use-address'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'

export const createGetPinMessageQuery = (
  conversationId: string,
  type: ConversationType,
  address: string
) =>
  queryOptions({
    enabled: !!conversationId && ['group', 'anonymous_group'].includes(type) && !!address,
    queryKey: CONVERSATION_QUERY_KEY.PINED_MESSAGE(conversationId),
    staleTime: Infinity,
    queryFn: async () => {
      return await container.groupContract.getPinnedMessage({
        from: address,
        to: conversationId
      })
    }
  })

export function useGetPinMessage() {
  const { id, type } = useConversationParams()
  const { hiddenAddress } = useAddress()
  return useQuery(createGetPinMessageQuery(id, type, hiddenAddress))
}
