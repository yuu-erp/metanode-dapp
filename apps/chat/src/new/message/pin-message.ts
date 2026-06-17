import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import type { Account } from '@/modules/account'
import { asyncPriorityQueue } from '@/modules/realtime'
import { getCurrentAccount } from '@/shared/hooks'
import { CONVERSATION_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { formatAddress } from '@/shared/utils'
import { queryOptions, useQuery } from '@tanstack/react-query'

async function getPinnedMessage(account: Account, input: BaseConversation) {
  console.log('first', { account, input })
  try {
    switch (input.type) {
      case 'p2p': {
        return await container.userContract.getPinnedMessages({
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: { partner: input.id }
        })
      }
      case 'group': {
        return await container.groupContract.getListPinnedMessagesGroup({
          from: account.hiddenAddress,
          to: input.id
        })
      }
      case 'anonymous_group': {
        return await container.anonymousGroupContract.getListPinnedMessagesCommunity({
          from: account.hiddenAddress,
          to: input.id
        })
      }
      default:
        throw new Error('[usePinnedMessage] Invalid type')
    }
  } catch (error) {
    console.error('getPinnedMessage error', error)
    throw error
  }
}

const createPinnedMessagesQuery = (input: BaseConversation) =>
  queryOptions({
    queryKey: CONVERSATION_QUERY_KEY.pinned(input.id),
    staleTime: Infinity,
    retry: 0,
    enabled: !!input.id,
    queryFn: async () => {
      const account = await getCurrentAccount()
      const rs = await getPinnedMessage(account, input)
      const data = rs.map((i) => formatAddress(i))
      return data
    }
  })

export function usePinnedMessages(input: BaseConversation) {
  return useQuery(createPinnedMessagesQuery(input))
}

export async function setPinnedMessageState(
  input: BaseConversation,
  messageId: string,
  isPinned: boolean
) {
  await queryClient.ensureQueryData(createPinnedMessagesQuery(input))
  messageId = formatAddress(messageId)
  queryClient.setQueryData(CONVERSATION_QUERY_KEY.pinned(input.id), (old: string[]) => {
    if (isPinned) return [...new Set([...old, messageId])]
    else return old.filter((i) => i !== messageId)
  })
}

export async function pinMessage(value: boolean, messageId: string, base: BaseConversation) {
  const account = await getCurrentAccount()

  return asyncPriorityQueue.add(async () => {
    switch (base.type) {
      case 'p2p': {
        const payload = {
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: { partner: base.id, messageId }
        }
        if (value) {
          await container.userContract.pinMessage(payload)
        } else {
          await container.userContract.unpinMessage(payload)
        }
        break
      }
      case 'anonymous_group': {
        const payload = {
          from: account.hiddenAddress,
          to: base.id,
          inputData: { isPinned: value, messageId }
        }
        await container.groupContract.pinMessage(payload)

        break
      }
      case 'group': {
        const payload = {
          from: account.hiddenAddress,
          to: base.id,
          inputData: { isPinned: value, messageId }
        }
        await container.groupContract.pinMessageForAllMembers(payload)

        break
      }
      default:
        throw new Error('[handlePinToServer] Invalid type')
    }
  })
}

export function useIsPinned(id: string) {
  const { base } = useCurrentState()

  const { data } = usePinnedMessages(base)
  return { isPinned: data?.includes(id) }
}
