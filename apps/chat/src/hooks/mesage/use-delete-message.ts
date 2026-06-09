import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import { removeMessgeById } from '@/new/message'
import { removeIdInMessgeList } from '@/new/message/list-mesage'
import { useMutation } from '@tanstack/react-query'

/**
 * Hook delete message (chỉ cho phép text)
 */
export function useDeleteMessage() {
  const { account, base } = useCurrentState()

  return useMutation<void, Error, any>({
    mutationFn: async (message: FulleMessage) => {
      if (!account) throw new Error('[useDeleteMessage] Invalid account')
      removeMessgeById(message.id)
      removeIdInMessgeList(message.id, base.id)

      switch (base.type) {
        case 'p2p': {
          return await container.userContract.deleteMessageV2({
            from: account.hiddenAddress,
            to: account.contractAddress,
            inputData: { _messageId: message.id, partnerContract: base.id }
          })
        }
        case 'anonymous_group':
        case 'group': {
          return await container.groupContract.deleteMessage({
            from: account.hiddenAddress,
            to: base.id,
            inputData: { messageId: message.id }
          })
        }

        default:
          throw new Error('[useDeleteMessage] Invalid type')
      }
    },

    onSuccess: (_, { message }) => {
      console.log('[useDeleteMessage] Delete message successfully ✅', message.id)
    },

    onError: (error, { message }) => {
      console.error('[useDeleteMessage] Delete message error ❌', message.id, error)
    }
  })
}
