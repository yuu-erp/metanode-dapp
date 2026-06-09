import { container } from '@/container'
import { useCurrentState } from '@/hooks/use-current-state'
import { encodeBase64 } from '@/modules/message/utils'
import { getCurrentAccount } from '@/shared/hooks'
import { MESSAGE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { useMutation } from '@tanstack/react-query'
import { getCurrentIdentity, useCurrentIdentity } from '../me'
import { setMessageInfo, useMessageById } from './message-info'
import { modalActions } from '@/stores/modal.store'

export type ReactionItem = {
  reaction: string
  reactor: string[]
}

export function setReaction(id: string, reactions: ReactionItemData[]) {
  setMessageInfo(id, {
    reactions
  })
}

function updateMessageReaction(
  id: string,
  updater: (reactions: ReactionItemData[]) => ReactionItemData[]
) {
  queryClient.setQueryData<FulleMessage>(MESSAGE_QUERY_KEY.info(id), (old) => {
    if (!old) return old

    return {
      ...old,
      reactions: updater(old.reactions ?? [])
    }
  })
}

export function addReaction(
  id: string,
  input: {
    reaction: string
    reactor: string
  }
) {
  updateMessageReaction(id, (old) => {
    // Xóa reactor khỏi tất cả reaction hiện tại
    const cleaned = old
      .map((item) => ({
        ...item,
        reactor: item.reactor.filter((reactor) => reactor !== input.reactor)
      }))
      .filter((item) => item.reactor.length > 0)

    const index = cleaned.findIndex((item) => item.reaction === input.reaction)

    // Chưa có reaction này
    if (index === -1) {
      return [
        ...cleaned,
        {
          reaction: input.reaction,
          reactor: [input.reactor]
        }
      ]
    }

    // Đã có reaction này rồi
    return cleaned.map((item, i) =>
      i === index
        ? {
            ...item,
            reactor: [...item.reactor, input.reactor]
          }
        : item
    )
  })
}

export function removeReaction(id: string, reactor: string) {
  updateMessageReaction(id, (old) => {
    return old
      .map((item) => ({
        ...item,
        reactor: item.reactor.filter((current) => current !== reactor)
      }))
      .filter((item) => item.reactor.length > 0)
  })
}

async function reactMessageBc(
  input: { messageId: string; reaction: string },
  base: BaseConversation
) {
  const account = await getCurrentAccount()
  const { messageId } = input
  const reaction = encodeBase64(input.reaction)
  switch (base.type) {
    case 'p2p': {
      return container.userContract.reactToMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: {
          _messageId: messageId,
          _reaction: reaction,
          _reactionToPartner: reaction,
          partnerContract: base.id
        }
      })
    }
    case 'group': {
      return container.groupContract.reactToMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: {
          messageId: messageId,
          reaction: reaction
        }
      })
    }
    case 'anonymous_group': {
      return container.anonymousGroupContract.reactToMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: {
          messageId: messageId,
          reaction: reaction
        }
      })
    }

    default:
      throw new Error('[reactMessageBc] Invalid type')
  }
}

async function unReactMessageBc(messageId: string, base: BaseConversation) {
  const account = await getCurrentAccount()
  switch (base.type) {
    case 'p2p': {
      return container.userContract.unReactToMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: {
          messageId: messageId,
          partnerContract: base.id
        }
      })
    }
    case 'group': {
      return container.groupContract.unReactToMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: {
          messageId: messageId
        }
      })
    }
    case 'anonymous_group': {
      return container.anonymousGroupContract.unReactToMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: {
          messageId: messageId
        }
      })
    }

    default:
      throw new Error('[reactMessageBc] Invalid type')
  }
}

export function useReactMessage() {
  const { base } = useCurrentState()
  return useMutation({
    mutationFn: async ({
      value,
      ...rest
    }: {
      messageId: string
      reaction: string
      value: boolean
    }) => {
      if (value) {
        addReaction(rest.messageId, {
          reaction: rest.reaction,
          reactor: await getCurrentIdentity(base)
        })
        modalActions.close()
        await reactMessageBc(rest, base)
      } else {
        removeReaction(rest.messageId, await getCurrentIdentity(base))
        await unReactMessageBc(rest.messageId, base)
      }
    }
  })
}

export function useSelectedReaction(reaction: string, messageId: string) {
  const { base } = useCurrentState()
  const { data: identity = '' } = useCurrentIdentity(base)

  const { data } = useMessageById(messageId, base)
  return data?.reactions.some(
    (item) => item.reaction === reaction && item.reactor.includes(identity)
  )
}
