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
      console.log('conversationKey', conversation.conversationKey)

      const payload = {
        type: 'system',
        kind: 'leave_group'
      }

      const encryptMessage = (
        await encryptAESGCM(conversation.conversationKey, JSON.stringify(payload))
      )?.result
      await container.groupContract.leaveGroup({
        from: account.hiddenAddress,
        to: conversation.conversationId,
        inputData: {
          encryptedContent: encryptMessage
        }
      })

      await container.conversationService.deleteConversation(
        account.address,
        conversation.conversationId
      )
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
      })
      navigate({ to: '/' })
    }
  })
}
