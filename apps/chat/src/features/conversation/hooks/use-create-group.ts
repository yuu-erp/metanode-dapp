import { useMutation, useQueryClient } from '@tanstack/react-query'

import { container } from '@/container'
import type { ConversationType, PayloadCreateGroup } from '@/modules/conversation'
import type { Account } from '@/modules/account'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'
import { useNavigate } from '@tanstack/react-router'

export function useCreateGroup(groupType: ConversationType) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ account, payload }: { account: Account; payload: PayloadCreateGroup }) => {
      if (groupType === 'group') {
        const group = await container.conversationService.createGroup(account, payload)
        // Fetch latest list
        await container.conversationService.addMembers(
          account,
          group.contractAddress,
          group.groupKey,
          payload.members
        )

        return group.contractAddress
      } else if (groupType === 'anonymous_group') {
        const group = await container.conversationService.createAnonymousCommunity(account, payload)

        await container.conversationService.addMembersInAnonymousGroup(
          account,
          group.groupContract,
          group.groupKey,
          payload.members
        )

        return group.groupContract
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(variables.account.address)
      })
      console.log('thanhduy - navigate groupType', { groupType })
      navigate({
        to: '/group/$id',
        params: { id: _data! },
        search: {
          type: groupType
        }
      })
    },
    onError: (error) => {
      console.log('Create group error', error)
    }
  })
}
