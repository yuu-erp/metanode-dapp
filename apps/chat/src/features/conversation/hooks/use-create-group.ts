import { useMutation, useQueryClient } from '@tanstack/react-query'

import { container } from '@/container'
import type { PayloadCreateGroup } from '@/modules/conversation'
import type { Account } from '@/modules/account'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ account, payload }: { account: Account; payload: PayloadCreateGroup }) => {
      await container.conversationService.createGroup(account, payload)
      // Sync to get the new group
      await container.conversationService.syncByAccount(account)
      // Fetch latest list
      const conversations = await container.conversationService.getConversationList(account.address)
      // Assumed the new group is the most recent one or matching name
      // For now, let's take the first one that is group and has matching name
      const newGroup = conversations.find(
        (c) => c.conversationType === 'group' && c.name === payload.name
      )
      return newGroup?.conversationId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(variables.account.address)
      })
    },
    onError: (error) => {
      console.log('Create group error', error)
    }
  })
}
