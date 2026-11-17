import { container } from '@/container'
import type { Account } from '@/modules/account'
import { encodeBase64 } from '@/modules/message/utils'
import { formatAddress } from '@/shared/utils'
import { applyPureChatIdentity } from './apply-pure-chat-identity'
import { buildPureAccount } from './build-pure-account'
import { fetchConversationListFromContract } from './fetch-conversation-list'
import { findConversationInInbox, toSendBaseConversation } from './resolve-conversation-target'

async function resolveMessageActionContext(identityInput: string, conversationIdInput: string) {
  const { contract } = await applyPureChatIdentity(identityInput)
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)

  const inbox = await fetchConversationListFromContract({
    walletAddress: contract.walletAddress,
    userContractAddress: contract.contractAddress,
  })

  const target = findConversationInInbox(inbox, conversationIdInput)
  if (!target) {
    throw new Error('conversationId không có trong inbox')
  }

  const base = toSendBaseConversation(
    target.conversationType,
    target.conversationId,
    contract.contractAddress,
  )

  return { account, contract, target, base }
}

/** `getPinnedMessage` trong `pin-message.ts` */
export async function fetchPinnedMessageIds(account: Account, base: BaseConversation) {
  switch (base.type) {
    case 'p2p': {
      const rs = await container.userContract.getPinnedMessages({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { partner: base.id },
      })
      const rs2 = await container.userContract.getPartnerPinnedMessages({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { partner: base.id },
      })
      return [...new Set([...rs, ...rs2])].map((i) => formatAddress(i))
    }
    case 'group':
      return (
        await container.groupContract.getListPinnedMessagesGroup({
          from: account.hiddenAddress,
          to: base.id,
        })
      ).map((i) => formatAddress(i))
    case 'anonymous_group':
      return (
        await container.anonymousGroupContract.getListPinnedMessagesCommunity({
          from: account.hiddenAddress,
          to: base.id,
        })
      ).map((i) => formatAddress(i))
    default:
      throw new Error(`[pure] pin list không hỗ trợ type: ${base.type}`)
  }
}

/** `pinMessage` trong `pin-message.ts` */
async function pinOnChain(
  account: Account,
  base: BaseConversation,
  messageId: string,
  pinned: boolean,
) {
  switch (base.type) {
    case 'p2p': {
      const payload = {
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { partner: base.id, messageId },
      }
      if (pinned) await container.userContract.pinMessage(payload)
      else await container.userContract.unpinMessage(payload)
      return pinned ? 'userContract.pinMessage' : 'userContract.unpinMessage'
    }
    case 'anonymous_group': {
      await container.groupContract.pinMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: { isPinned: pinned, messageId },
      })
      return 'groupContract.pinMessage (anonymous)'
    }
    case 'group': {
      await container.groupContract.pinMessageForAllMembers({
        from: account.hiddenAddress,
        to: base.id,
        inputData: { isPinned: pinned, messageId },
      })
      return 'groupContract.pinMessageForAllMembers'
    }
    default:
      throw new Error(`[pure] pin không hỗ trợ type: ${base.type}`)
  }
}

/** `reactMessageBc` / `unReactMessageBc` trong `react-message.ts` */
async function reactOnChain(
  account: Account,
  base: BaseConversation,
  messageId: string,
  reactionRaw: string,
  add: boolean,
) {
  if (add) {
    const reaction = encodeBase64(reactionRaw)
    switch (base.type) {
      case 'p2p':
        await container.userContract.reactToMessage({
          from: account.hiddenAddress,
          to: account.contractAddress,
          inputData: {
            _messageId: messageId,
            _reaction: reaction,
            _reactionToPartner: reaction,
            partnerContract: base.id,
          },
        })
        return { contractMethod: 'userContract.reactToMessage', reactionEncoded: reaction }
      case 'group':
        await container.groupContract.reactToMessage({
          from: account.hiddenAddress,
          to: base.id,
          inputData: { messageId, reaction },
        })
        return { contractMethod: 'groupContract.reactToMessage', reactionEncoded: reaction }
      case 'anonymous_group':
        await container.anonymousGroupContract.reactToMessage({
          from: account.hiddenAddress,
          to: base.id,
          inputData: { messageId, reaction },
        })
        return {
          contractMethod: 'anonymousGroupContract.reactToMessage',
          reactionEncoded: reaction,
        }
      default:
        throw new Error(`[pure] react không hỗ trợ type: ${base.type}`)
    }
  }

  switch (base.type) {
    case 'p2p':
      await container.userContract.unReactToMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: { messageId, partnerContract: base.id },
      })
      return { contractMethod: 'userContract.unReactToMessage' }
    case 'group':
      await container.groupContract.unReactToMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: { messageId },
      })
      return { contractMethod: 'groupContract.unReactToMessage' }
    case 'anonymous_group':
      await container.anonymousGroupContract.unReactToMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: { messageId },
      })
      return { contractMethod: 'anonymousGroupContract.unReactToMessage' }
    default:
      throw new Error(`[pure] unreact không hỗ trợ type: ${base.type}`)
  }
}

export async function purePinMessage(options: {
  identityInput: string
  conversationId: string
  messageId: string
}) {
  const ctx = await resolveMessageActionContext(options.identityInput, options.conversationId)
  const messageId = options.messageId.trim()
  if (!messageId) throw new Error('Cần messageId')

  const contractMethod = await pinOnChain(ctx.account, ctx.base, messageId, true)
  const pinnedIds = await fetchPinnedMessageIds(ctx.account, ctx.base)

  return {
    action: 'pin',
    contractMethod,
    conversationType: ctx.target.conversationType,
    base: ctx.base,
    messageId: formatAddress(messageId),
    pinnedMessageIds: pinnedIds,
  }
}

export async function pureUnpinMessage(options: {
  identityInput: string
  conversationId: string
  messageId: string
}) {
  const ctx = await resolveMessageActionContext(options.identityInput, options.conversationId)
  const messageId = options.messageId.trim()
  if (!messageId) throw new Error('Cần messageId')

  const contractMethod = await pinOnChain(ctx.account, ctx.base, messageId, false)
  const pinnedIds = await fetchPinnedMessageIds(ctx.account, ctx.base)

  return {
    action: 'unpin',
    contractMethod,
    conversationType: ctx.target.conversationType,
    base: ctx.base,
    messageId: formatAddress(messageId),
    pinnedMessageIds: pinnedIds,
  }
}

export async function pureReactToMessage(options: {
  identityInput: string
  conversationId: string
  messageId: string
  reaction: string
}) {
  const ctx = await resolveMessageActionContext(options.identityInput, options.conversationId)
  const messageId = options.messageId.trim()
  const reaction = options.reaction.trim()
  if (!messageId) throw new Error('Cần messageId')
  if (!reaction) throw new Error('Cần reaction (emoji / text)')

  const tx = await reactOnChain(ctx.account, ctx.base, messageId, reaction, true)

  return {
    action: 'react',
    conversationType: ctx.target.conversationType,
    base: ctx.base,
    messageId: formatAddress(messageId),
    reaction,
    ...tx,
  }
}

export async function pureUnreactMessage(options: {
  identityInput: string
  conversationId: string
  messageId: string
}) {
  const ctx = await resolveMessageActionContext(options.identityInput, options.conversationId)
  const messageId = options.messageId.trim()
  if (!messageId) throw new Error('Cần messageId')

  const tx = await reactOnChain(ctx.account, ctx.base, messageId, '', false)

  return {
    action: 'unreact',
    conversationType: ctx.target.conversationType,
    base: ctx.base,
    messageId: formatAddress(messageId),
    ...tx,
  }
}
