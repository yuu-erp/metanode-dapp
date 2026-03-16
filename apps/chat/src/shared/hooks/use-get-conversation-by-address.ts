import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { useCurrentAccount, useGetConversationId } from '@/shared/hooks'
import { ACCOUNT_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery } from '@tanstack/react-query'
import { isAddress } from 'ethers'

export function useGetConversationByAddress(address: string, type: ConversationType) {
  const { data: account } = useCurrentAccount()

  const { data: contractAddress } = useQuery({
    queryKey: ACCOUNT_QUERY_KEY.CONTRACT_ADDRESS(address),
    enabled: !!address && !!account,
    queryFn: () => {
      if (!isAddress(address)) return

      return container.factoryContract.getUserContract({
        from: account!.hiddenAddress,
        inputData: {
          user: address
        }
      })
    }
  })

  const { data } = useGetConversationId(contractAddress ?? '', type)

  return data
}
