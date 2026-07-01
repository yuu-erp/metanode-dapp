import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { queryOptions, useQuery } from '@tanstack/react-query'
import {
  baseMessageToMessage,
  groupMessageToBaseMessage,
  p2pMessageToBaseMessage
} from './message.utils'
import { useCurrentState } from '@/hooks/use-current-state'

export async function getRawMessageById(
  id: string,
  conversation: BaseConversation
): Promise<BaseMessage> {
  const account = await getCurrentAccount()

  switch (conversation.type) {
    case 'p2p': {
      const rs = await container.userContract.getMessageById({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { _messageId: id }
      })
      const [myReact, urReact] = await Promise.all([
        container.userContract.getReaction({
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: { _messageId: id, _reactor: account.contractAddress }
        }),
        container.userContract.getReaction({
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: { _messageId: id, _reactor: conversation.id }
        })
      ])
      console.log('myReactmyReactmyReactmyReact', { myReact, urReact })
      let reactionString = ''
      if (myReact) {
        reactionString += 'me:' + myReact
      }
      if (urReact) {
        if (!!reactionString) reactionString += ','
        reactionString += 'partner:' + urReact
      }
      //@ts-ignore
      rs.reactionSummary = reactionString
      if (reactionString) console.log('reactionString', reactionString)

      //@ts-ignore
      if (rs?.messageId === '712cc3b1dfd0f14f21f35532408a0803b71f3e7219e8d4956ef23df83f2eb1a8') {
        console.log('asddfsaadsasdasdf 2', { rs, myReact, urReact })
      }

      return p2pMessageToBaseMessage(rs)
    }
    case 'group': {
      return container.groupContract
        .getMessageById({
          from: account.hiddenAddress,
          to: conversation.id,
          inputData: { _messageId: id }
        })
        .then(groupMessageToBaseMessage)
    }
    case 'anonymous_group': {
      return container.anonymousGroupContract
        .getMessageById({
          from: account.hiddenAddress,
          to: conversation.id,
          inputData: { _messageId: id }
        })
        .then((message) => groupMessageToBaseMessage(message, true))
    }

    default:
      throw new Error('[getRawMessageById] Invalid type')
  }
}

export async function getMessageInfoById(id: string, input: BaseConversation) {
  const baseMessge = await getRawMessageById(id, input)
  console.log('getMessageInfoById 1', baseMessge)
  const rs = await baseMessageToMessage(baseMessge, input)
  console.log('getMessageInfoById 2', rs)
  if (rs?.content === 'ggaa') {
    console.log('getMessageInfoById data', { rs, baseMessge })
  }
  return rs
}

export const createMessageInfoQuery = (id: string = '', input: BaseConversation) =>
  queryOptions({
    queryKey: MESSAGE_QUERY_KEY.info(id),
    enabled: !!id && !!input.id && id.length === 64 && !!input?.id && !!input?.type,
    staleTime: Infinity,
    retry: 0,
    queryFn: async () => getMessageInfoById(id, input)
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
        ...value
      }
    }
    return { ...old, ...value, isRead: old?.isRead || value?.isRead }
  })
}

export function removeMessgeById(id: string) {
  queryClient.invalidateQueries({ queryKey: MESSAGE_QUERY_KEY.info(id) })
}
