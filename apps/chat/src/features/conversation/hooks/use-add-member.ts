import type { Account } from '@/modules/account'
import type { Conversation, ConversationType, PayloadAddMembers } from '@/modules/conversation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { container } from '@/container'
import { CONVERSATION_QUERY_KEY } from '@/shared/lib/react-query'

export function useAddMember(converstaionType?: ConversationType) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      account,
      members,
      group
    }: {
      account: Account
      members: PayloadAddMembers[]
      group: Conversation
    }) => {
      if (converstaionType === 'group') {
        await container.conversationService.addMembers(
          account,
          group.conversationId,
          group.conversationKey,
          members
        )
      } else if (converstaionType === 'anonymous_group') {
        await container.conversationService.addMembersInAnonymousGroup(
          account,
          group.conversationId,
          group.conversationKey,
          members
        )
      }

      return group.conversationId
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONVERSATION_QUERY_KEY.GROUP_MEMBERS(variables.group.conversationId)
      })
    },
    onError: (error) => {
      console.log('add member error', error)
    }
  })
}
