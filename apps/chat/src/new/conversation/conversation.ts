import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { Conversation } from '@/modules/conversation'
import { getCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'

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
          console.log('getGroupInfo input.id', input.id)
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

export async function setConveration(id: string, value: Partial<Conversation>) {
  const account = await getCurrentAccount()

  queryClient.setQueryData(
    CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address),
    (old: Conversation[]) => {
      if (!old) return old
      return old.map((item) =>
        item.conversationId === id
          ? {
              ...item,
              ...value
            }
          : item
      )
    }
  )
}

export function useConversationInbox(id: string) {
  return useQuery(
    queryOptions({
      queryKey: CONVERSATION_QUERY_KEY.inbox(id),
      queryFn: async () => {
        const account = await getCurrentAccount()

        const rs = await container.userContract.conversationCache({
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: { '': id }
        })
        return { ...rs, lastMessageTimestamp: +rs.lastMessageTimestamp * 1000 }
      }
    })
  )
}
