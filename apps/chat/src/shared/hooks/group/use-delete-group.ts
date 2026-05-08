import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useConversationParams } from '../use-conversation-params'
import { useCurrentAccount } from '../use-current-account'

export function useDeleteGroup() {
  const { data: account } = useCurrentAccount()
  const { id, type } = useConversationParams()

  return useMutation({
    mutationFn: async () => {
      if (!account) return
      if (type === 'group') {
        await container.factoryContract.deleteGroup({
          from: account.hiddenAddress,
          to: id,
          inputData: { groupId: id }
        })
      } else if (type === 'anonymous_group') {
        await container.factoryContract.deleteAnonymousCommunity({
          from: account.hiddenAddress,
          to: id,
          inputData: { groupToDelete: id }
        })
      }
    },
    onSuccess: () => {
      toast.success('Group deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
