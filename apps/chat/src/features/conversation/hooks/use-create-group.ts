import { useMutation } from '@tanstack/react-query'

import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { ConversationType, PayloadCreateGroup } from '@/modules/conversation'
import { addConversation } from '@/new/conversation/list-conversation'
import { useNavigate } from '@tanstack/react-router'

export function useCreateGroup(groupType: ConversationType) {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ account, payload }: { account: Account; payload: PayloadCreateGroup }) => {
      let id = ''
      if (groupType === 'group') {
        const group = await container.conversationService.createGroup(account, payload)
        // Fetch latest list
        console.log('[useCreateGroup]', { group })

        await container.conversationService.addMembers(
          account,
          group.groupContractAddress,
          group.groupKey,
          payload.members
        )

        id = group.groupContractAddress
      } else if (groupType === 'anonymous_group') {
        const group = await container.conversationService.createAnonymousCommunity(account, payload)

        await container.conversationService.addMembersInAnonymousGroup(
          account,
          group.groupContract,
          group.groupKey,
          payload.members
        )

        id = group.groupContract
      }
      await addConversation({ type: groupType, id })
      return id
    },
    onSuccess: (_data) => {
      navigate({
        to: '/$type/$id',
        params: { id: _data!, type: groupType }
      })
    },
    onError: (error) => {
      console.log('Create group error', error)
    }
  })
}
