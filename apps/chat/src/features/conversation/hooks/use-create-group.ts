import { useMutation, useQueryClient } from '@tanstack/react-query'

import { container } from '@/container'
import type { PayloadCreateGroup } from '@/modules/conversation'
import type { Account } from '@/modules/account'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useCreateGroup() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ account, payload }: { account: Account; payload: PayloadCreateGroup }) => {
      const group = await container.conversationService.createGroup(account, payload)

      // Sync to get the new group
      await container.conversationService.syncByAccount(account)
      // Fetch latest list
      await container.conversationService.addMembers(
        account,
        group.contractAddress,
        group.groupKey,
        payload.members
      )

      return group.contractAddress
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(variables.account.address)
      })
      navigate({ to: '/group/$id', params: { id: _data } })
    },
    onError: (error) => {
      console.log('Create group error', error)
    }
  })
}
