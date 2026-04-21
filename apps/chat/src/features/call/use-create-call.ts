import { container } from '@/container'
import type { Conversation } from '@/modules/conversation'
import type { Account } from '@/modules/account'
import { useMutation } from '@tanstack/react-query'

export const useCreateCall = () => {
  return useMutation({
    mutationFn: async ({
      account,
      conversation
    }: {
      account: Account
      conversation: Conversation
    }) => {
      return await container.callService.createCall(account, conversation)
    }
  })
}
