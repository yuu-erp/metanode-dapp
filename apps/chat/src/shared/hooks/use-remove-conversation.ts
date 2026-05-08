import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { compareAddress } from '../lib'
import { removeConversationInReactQuery } from '../utils/remove-conversation-in-react-query'
import { useAddress } from './accounts/use-address'
import { useConversationParams } from './use-conversation-params'

export function useRemoveConversation(conversationId: string, type: string) {
  const { address, hiddenAddress, contractAddress } = useAddress()

  const navigate = useNavigate()
  const { id } = useConversationParams()

  return useMutation({
    mutationFn: async () => {
      removeConversationInReactQuery(address, conversationId)
      container.conversationService.deleteConversation(address, conversationId)
      if (compareAddress(id, conversationId)) {
        navigate({ to: '/' })
      }
      const base = { from: hiddenAddress, to: contractAddress }
      if (type === 'p2p') {
        await container.userContract.removeContact({
          ...base,
          inputData: { _contactAddress: conversationId }
        })
      } else if (type === 'group') {
        const groupId = await container.groupContract.groupId({
          from: hiddenAddress,
          to: conversationId
        })
        await container.factoryContract.deleteGroup({
          ...base,
          inputData: { groupId }
        })
      } else if (type === 'anonymous_group') {
        await container.factoryContract.deleteAnonymousCommunity({
          ...base,
          inputData: { groupToDelete: conversationId }
        })
      }
    }
  })
}
