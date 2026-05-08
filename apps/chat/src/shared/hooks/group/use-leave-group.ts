import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'
import { useConversationParams } from '../use-conversation-params'
import { useCurrentAccount } from '../use-current-account'
import { useGetConversationId } from '../use-get-conversation-id'

export function useLeaveGroup() {
  const { data: account } = useCurrentAccount()
  const { type, id } = useConversationParams()
  const { data: conversation } = useGetConversationId(id, type)

  return useMutation({
    mutationFn: async () => {
      if (!account || !conversation) return

      await container.messageService.sendGroupMessae(account, conversation, {
        type: 'system',
        eventName: 'leave_group'
      })
    }
  })
}
