import { container } from '@/container'
import type { ConversationType } from '@/modules/conversation'
import { fetchConversationListFromContract } from './fetch-conversation-list'
import { findConversationInInbox } from './resolve-conversation-target'

/** Luồng `getMessaeges` trong `src/new/message/list-mesage.ts` (raw on-chain, chưa decrypt). */
export async function fetchMessagesByConversationTarget(options: {
  walletAddress: string
  userContractAddress: string
  conversationId: string
  page?: number
  limit?: number
}) {
  const { walletAddress, userContractAddress, conversationId, page = 1, limit = 50 } = options

  const inbox = await fetchConversationListFromContract({
    walletAddress,
    userContractAddress,
  })

  const target = findConversationInInbox(inbox, conversationId)
  if (!target) {
    throw new Error(
      `conversationId không có trong inbox — kiểm tra address hoặc gọi list conversation trước: ${conversationId}`,
    )
  }

  const { conversationType } = target
  const messages = await fetchMessagesByType({
    conversationType,
    walletAddress,
    userContractAddress,
    conversationId: target.conversationId,
    page,
    limit,
  })

  return {
    conversationType,
    contractMethod: messages.contractMethod,
    inboxItem: target.inboxItem,
    messages: messages.data,
  }
}

async function fetchMessagesByType(params: {
  conversationType: ConversationType
  walletAddress: string
  userContractAddress: string
  conversationId: string
  page: number
  limit: number
}) {
  const { conversationType, walletAddress, userContractAddress, conversationId, page, limit } =
    params

  switch (conversationType) {
    case 'p2p': {
      const data = await container.userContract.getProcessedP2PMessages({
        from: walletAddress,
        to: userContractAddress,
        inputData: {
          partnerContractAddress: conversationId,
          limit,
          page,
        },
      })
      return { contractMethod: 'userContract.getProcessedP2PMessages', data }
    }
    case 'private': {
      const data = await container.userContract.getProcessedP2PMessages({
        from: walletAddress,
        to: userContractAddress,
        inputData: {
          partnerContractAddress: userContractAddress,
          limit,
          page,
        },
      })
      return { contractMethod: 'userContract.getProcessedP2PMessages (saved/private)', data }
    }
    case 'group': {
      const data = await container.groupContract.getProcessedGroupMessages({
        from: walletAddress,
        to: conversationId,
        inputData: { limit, page },
      })
      return { contractMethod: 'groupContract.getProcessedGroupMessages', data }
    }
    case 'anonymous_group': {
      const data = await container.anonymousGroupContract.getProcessedGroupMessagesWithReactions({
        from: walletAddress,
        to: conversationId,
        inputData: {
          limit,
          page,
          sender: walletAddress,
        },
      })
      return {
        contractMethod: 'anonymousGroupContract.getProcessedGroupMessagesWithReactions',
        data,
      }
    }
    default:
      throw new Error(`[pure] conversationType không hỗ trợ: ${conversationType}`)
  }
}
