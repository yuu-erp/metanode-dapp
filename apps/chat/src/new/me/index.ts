import { getCurrentAccount } from '@/shared/hooks'
import { ME_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'
import { getAlias } from '../conversation/my-info'

export async function getCurrentIdentity(base: BaseConversation) {
  console.log('baase', base)
  switch (base.type) {
    case 'p2p':
      return (await getCurrentAccount()).contractAddress
    case 'group':
      return (await getCurrentAccount()).address
    case 'anonymous_group':
      return getAlias(base.id)
    default:
      throw new Error('[getCurrentIdentity] Invalid type')
  }
}

export function useCurrentIdentity(base: BaseConversation) {
  return useQuery({
    queryKey: ME_QUERY_KEY.identity(base.id),
    queryFn: () => getCurrentIdentity(base)
  })
}
