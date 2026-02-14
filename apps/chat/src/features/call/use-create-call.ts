import { container } from '@/container'
import type { Conversation } from '@/modules/conversation'
import type { Account } from '@/modules/account'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { chatClient } from '@/modules/call/client'

export const useCreateCall = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      account,
      conversation
    }: {
      account: Account
      conversation: Conversation
    }) => {
      const data = await container.callService.createCall(account, conversation)
      //@ts-ignore
      if (window?.finSdk) {
        chatClient.useMeetingData.getState().setData(data)
        navigate({ to: '/meeting' })
      }

      return data
    }
  })
}
