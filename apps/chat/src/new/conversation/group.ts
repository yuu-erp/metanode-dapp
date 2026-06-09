import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { GROUP_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { queryOptions } from '@tanstack/react-query'

export const createGroupMemberQuery = (base: BaseConversation) =>
  queryOptions({
    queryKey: ['tests', base.id],
    queryFn: async () => {
      const account = await getCurrentAccount()

      const rs = await container.groupContract.getMemberListGroup({
        from: account.hiddenAddress,
        to: base.id
      })
      return rs
    }
  })

export function getGroupMemberList(base: BaseConversation) {
  return queryClient.ensureQueryData(createGroupMemberQuery(base))
}

export const createGroupNameQuery = (conversationId: string) =>
  queryOptions({
    queryKey: GROUP_QUERY_KEY.name(conversationId),
    staleTime: Infinity,
    queryFn: async () => {
      const account = await getCurrentAccount()

      return container.groupContract.groupName({
        from: account.hiddenAddress,
        to: conversationId
      })
    }
  })

export function getGroupName(conversationId: string) {
  return queryClient.ensureQueryData(createGroupNameQuery(conversationId))
}
