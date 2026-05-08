import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'
import { removeConversationInReactQuery } from '../utils/remove-conversation-in-react-query'
import { useAddress } from './accounts/use-address'
import { useConversationParams } from './use-conversation-params'

export function useDeleteGroup(groupId: string) {
  const { address, hiddenAddress } = useAddress()
  const { type } = useConversationParams()

  return useMutation({
    mutationFn: async () => {
      removeConversationInReactQuery(address, groupId)
      if (type === 'group') {
        await container.factoryContract.deleteGroup({
          from: hiddenAddress,
          to: groupId,
          inputData: { groupId }
        })
      } else if (type === 'anonymous_group') {
        await container.factoryContract.deleteAnonymousCommunity({
          from: hiddenAddress,
          to: groupId,
          inputData: { groupToDelete: groupId }
        })
      } else {
        throw new Error('Invalid conversation type')
      }
    }
  })
}
