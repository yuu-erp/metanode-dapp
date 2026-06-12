import { useMutation } from '@tanstack/react-query'
import { useCurrentState } from '../use-current-state'

/**
 * Hook edit message (chỉ cho phép text)
 */
export function useEditMessage() {
  const { account, conversation } = useCurrentState()

  return useMutation({
    mutationFn: async ({ message }: { message: FulleMessage; newContent: string }) => {
      throw new Error('hihi')
      if (!account || !conversation) return
      // runtime safety (phòng khi ai đó bypass type)
      if (message.type !== 'text') {
        throw new Error('Only text messages can be edited')
      }

      // switch (conversation.conversationType) {
      //   case 'p2p': {
      //     return container.messageService.editMessage(account, conversation, messageOld, payload)
      //   }
      //   case 'group':
      //   case 'anonymous_group':
      //     return container.messageService.editGroupMessage(
      //       account,
      //       conversation,
      //       messageOld,
      //       payload
      //     )

      //   default:
      //     throw new Error('[useEditMessage] Invalid conversation type')
      // }
    }
  })
}
