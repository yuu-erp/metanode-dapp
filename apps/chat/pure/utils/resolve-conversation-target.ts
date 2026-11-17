import type { ConversationType } from '@/modules/conversation'
import type { GetFullInboxOutput } from '@/modules/blockchain/user-contract/types'
import { compareAddress } from '@/shared/lib'

export type ResolvedInboxConversation = {
  conversationId: string
  conversationType: ConversationType
  inboxItem: GetFullInboxOutput
}

export function toSendBaseConversation(
  conversationType: ConversationType,
  conversationId: string,
  userContractAddress: string,
): BaseConversation {
  if (conversationType === 'private') {
    return { id: userContractAddress, type: 'p2p' }
  }
  const type = conversationType === 'p2p' ? 'p2p' : conversationType
  return { id: conversationId, type }
}

export function findConversationInInbox(
  inbox: GetFullInboxOutput[],
  conversationId: string,
): ResolvedInboxConversation | undefined {
  const inboxItem = inbox.find((item) => compareAddress(item.conversationId, conversationId))
  if (!inboxItem) return undefined

  return {
    conversationId: inboxItem.conversationId,
    conversationType: inboxItem.conversationType as ConversationType,
    inboxItem,
  }
}
