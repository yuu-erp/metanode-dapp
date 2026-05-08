import { container } from '@/container'
import { useAddress } from '@/shared/hooks/accounts/use-address'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export function useUpdateGroupInfo() {
  const { address, hiddenAddress } = useAddress()
  const { id } = useConversationParams()

  return useMutation({
    mutationFn: async (input: { name?: string; avatar?: string }) => {
      const info = await container.groupContract.getGroupInfo({
        from: hiddenAddress,
        to: id
      })

      await container.groupContract.updateGroupInfo({
        from: address,
        to: id,
        inputData: {
          _newName: input.name || info.name,
          _newAvatar: input.avatar || info.avatar,
          _newDescription: ''
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_QUERY_KEY.CONVERSATION(id) })
    }
  })
}
