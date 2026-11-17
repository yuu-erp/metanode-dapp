import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  baseMessageToMessage,
  groupMessageToBaseMessage,
  isSavedMessagesConversation,
  p2pMessageToBaseMessage,
} from './message.utils'
import { useCurrentState } from '@/hooks/use-current-state'

export async function getRawMessageById(
  id: string,
  conversation: BaseConversation,
): Promise<BaseMessage> {
  const account = await getCurrentAccount()

  switch (conversation.type) {
    case 'p2p':
    case 'private': {
      const isSaved = isSavedMessagesConversation(conversation.id, account.contractAddress)
      const rs = await container.userContract.getMessageById({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { _messageId: id },
      })
      const myReact = await container.userContract.getReaction({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { _messageId: id, _reactor: account.contractAddress },
      })
      let reactionString = ''
      if (myReact) {
        reactionString += 'me:' + myReact
      }
      if (!isSaved) {
        const urReact = await container.userContract.getReaction({
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: { _messageId: id, _reactor: conversation.id },
        })
        if (urReact) {
          if (reactionString) reactionString += ','
          reactionString += 'partner:' + urReact
        }
      }
      //@ts-ignore
      rs.reactionSummary = reactionString

      return p2pMessageToBaseMessage(rs)
    }
    case 'group': {
      return container.groupContract
        .getMessageById({
          from: account.hiddenAddress,
          to: conversation.id,
          inputData: { _messageId: id },
        })
        .then(groupMessageToBaseMessage)
    }
    case 'anonymous_group': {
      return container.anonymousGroupContract
        .getMessageById({
          from: account.hiddenAddress,
          to: conversation.id,
          inputData: { _messageId: id },
        })
        .then((message) => groupMessageToBaseMessage(message, true))
    }

    default:
      throw new Error('[getRawMessageById] Invalid type')
  }
}

export async function getMessageInfoById(id: string, input: BaseConversation) {
  const baseMessge = await getRawMessageById(id, input)
  const rs = await baseMessageToMessage(baseMessge, input)

  return rs
}

export const createMessageInfoQuery = (id: string = '', input: BaseConversation) =>
  queryOptions({
    queryKey: MESSAGE_QUERY_KEY.info(id),
    enabled: !!id && !!input.id && id.length === 64 && !!input?.id && !!input?.type && +id !== 0,
    staleTime: Infinity,
    retry: 0,
    queryFn: async () => getMessageInfoById(id, input),
  })

export function useMessageById(id: string = '', base: BaseConversation) {
  return useQuery(createMessageInfoQuery(id, base))
}

export function useCurrentMessageById(id?: string) {
  const { base } = useCurrentState()
  return useQuery(createMessageInfoQuery(id, base))
}

export function getMessageById(id: string, base: BaseConversation) {
  return queryClient.ensureQueryData(createMessageInfoQuery(id, base))
}

export function setMessageInfo(id: string, value: Partial<FulleMessage>) {
  return queryClient.setQueryData(MESSAGE_QUERY_KEY.info(id), (old: FulleMessage) => {
    if (!old) {
      return {
        id,
        ...value,
      }
    }
    return { ...old, ...value, isRead: old?.isRead || value?.isRead }
  })
}

export function removeMessgeById(id: string) {
  queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(id) })
}
