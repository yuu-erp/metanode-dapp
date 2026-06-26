import { container } from '@/container'
import { useMutation } from '@tanstack/react-query'
import { useConversationParams } from '../use-conversation-params'
import { useCurrentAccount } from '../use-current-account'
import { useGetConversationId } from '../use-get-conversation-id'
import { encryptAESGCM } from '@metanodejs/system-core'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useLeaveGroup() {
  const { data: account } = useCurrentAccount()
  const { type, id } = useConversationParams()
  const { data: conversation } = useGetConversationId(id, type)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (!account || !conversation) return
      console.log('leave group 1')
      console.log('conversationKey', conversation.conversationKey)

      const payload = {
        type: 'system',
        kind: 'leave_group'
      }
      console.log('leave group 2')

      const encryptMessage = (
        await encryptAESGCM(conversation.conversationKey, JSON.stringify(payload))
      )?.result

      console.log('leave group 3')

      await container.groupContract.leaveGroup({
        from: account.hiddenAddress,
        to: conversation.conversationId,
        inputData: {
          encryptedContent: encryptMessage
        }
      })
      console.log('leave group 4')

      await container.conversationService.deleteConversation(
        account.address,
        conversation.conversationId
      )
      container.eventLogContainer.eventLog.offContract(conversation.conversationId)

      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
      })
      console.log('leave group 5')

      navigate({ to: '/' })
    }
  })
}
