import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { useCurrentAccount, useGetConversationId } from '@/shared/hooks'
import { ACCOUNT_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'

export function useGetConversationIdByAddress(user: string, enable?: boolean) {
  const { data: account } = useCurrentAccount()
  const { data: contractAddress } = useQuery({
    queryKey: ACCOUNT_QUERY_KEY.USER_BY_ADDRESS(user),
    enabled: !!user || (typeof enable === 'boolean' && enable),
    queryFn: () => {
      return container.factoryContract.getUserContract({
        from: account!.hiddenAddress,
        inputData: {
          user: user
        }
      })
    }
  })
  return contractAddress
}

export function useGetConversationByAddress(
  address: string,
  type: ConversationType,
  enabled = true,
  useDb?: boolean
) {
  const contractAddress = useGetConversationIdByAddress(address, enabled)

  const { data } = useGetConversationId(contractAddress ?? '', type, useDb)

  return data
}
