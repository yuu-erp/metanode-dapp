import { container } from '@/container'
import { createGetConversationIdQueryOptions } from '@/shared/hooks'
import { useAddress } from '@/shared/hooks/accounts/use-address'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export function useTransferAdmin() {
  const { type, id } = useConversationParams()
  const { address } = useAddress()

  return useMutation({
    mutationFn: async (user: string) => {
      const data = await queryClient.ensureQueryData(
        createGetConversationIdQueryOptions(user, 'p2p', false)
      )
      const key = data?.conversationKey ?? ''
      const userAddress = await container.userContract.owner({ from: address, to: user })

      if (type === 'group')
        await container.groupContract.transferAdmin({
          from: address,
          to: id,
          inputData: {
            _newPublicKeyAdmin: key,
            newAdmin: userAddress
          }
        })
      console.log('thanhduy - data')
    }
  })
}
