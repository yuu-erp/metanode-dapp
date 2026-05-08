import { container } from '@/container'
import { useAddress } from '@/shared/hooks/accounts/use-address'
import { useMutation } from '@tanstack/react-query'

export function usePinMessage(messageId: string, isPinned: boolean, conversationId: string) {
  const { address } = useAddress()

  return useMutation({
    mutationFn: async () => {
      container.groupContract.pinMessage({
        from: address,
        to: conversationId,
        inputData: {
          messageId,
          isPinned
        }
      })
    }
  })
}
