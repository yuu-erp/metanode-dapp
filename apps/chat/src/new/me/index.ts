import { getCurrentAccount } from '@/shared/hooks'
import { getAlias } from '../conversation/my-info'
import { useQuery } from '@tanstack/react-query'
import { ME_QUERY_KEY, MESSAGE_QUERY_KEY } from '@/shared/lib/react-query'

export async function getCurrentIdentity(base: BaseConversation) {
  switch (base.type) {
    case 'p2p':
      return (await getCurrentAccount()).contractAddress
    case 'group':
      return (await getCurrentAccount()).address
    case 'anonymous_group':
      return getAlias(base.id)
    default:
      throw new Error('[getSender] Invalid type')
  }
}

export function useCurrentIdentity(base: BaseConversation) {
  return useQuery({
    queryKey: ME_QUERY_KEY.identity(base.id),
    queryFn: () => getCurrentIdentity(base)
  })
}
