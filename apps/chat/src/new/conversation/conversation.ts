import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { Account } from '@/modules/account'
import { queryOptions } from '@tanstack/react-query'
import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'

// conversation key
export const createConversationKeyQuery = (input: BaseConversation, account: Account) =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.key(input.id),
    enabled: !!input.id,
    queryFn: () => container.conversationService.getConversationKey(input, account),
    staleTime: Infinity
  })

export async function getConversationKey(input: BaseConversation) {
  const account = await getCurrentAccount()
  return queryClient.ensureQueryData(createConversationKeyQuery(input, account))
}

// conversation name
export const createConversationDetail = (input: BaseConversation) =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.detail(input.id),
    enabled: !!input.id && !!input.type,
    queryFn: async () => {
      const account = await getCurrentAccount()

      const fns = {
        p2p: async () => {
          const rs = await container.userContract.userProfile({
            from: account.hiddenAddress,
            to: input.id
          })
          return {
            name: `${rs.lastName} ${rs.firstName}`,
            avatar: rs.avatar,
            userName: rs.userName
          }
        },
        group: async () => {
          const rs = await container.groupContract.getGroupInfo({
            from: account.hiddenAddress,
            to: input.id
          })
          return { name: rs.name, avatar: rs.avatar, userName: '' }
        },
        anonymous_group: async () => {
          const name = await container.anonymousGroupContract.groupName({
            from: account.hiddenAddress,
            to: input.id
          })
          const avatar = await container.anonymousGroupContract.groupAvatar({
            from: account.hiddenAddress,
            to: input.id
          })
          return { name, avatar, userName: '' }
        }
      }
      const fn = fns[input.type]
      return fn() as Promise<{ name: string; avatar: string; userName: string }>
    }
  })

export function getConversationDetail(input: BaseConversation) {
  return queryClient.ensureQueryData(createConversationDetail(input))
}
