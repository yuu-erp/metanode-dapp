import { decodeBase64 } from '@/modules/message/utils'
import { getCurrentAccount } from '@/shared/hooks'
import { compareAddress } from '@/shared/lib'
import { getConversationKey } from '../conversation'
import { getAlias } from '../conversation/my-info'
import { decryptMessage } from './crypto-message'

type Params = {
  value: string
  me: string
  partner: string
}

export function p2pReactionToReactionItems({ value, me, partner }: Params): ReactionItemData[] {
  const grouped = new Map<string, string[]>()

  for (const item of value.split(',')) {
    const [reactor, encodedReaction] = item.split(':')

    if (!encodedReaction) continue

    const address = reactor === 'me' ? me : reactor === 'partner' ? partner : undefined

    if (!address) continue

    const reaction = decodeBase64(encodedReaction)

    const reactors = grouped.get(reaction)

    if (reactors) {
      reactors.push(address)
    } else {
      grouped.set(reaction, [address])
    }
  }

  return Array.from(grouped, ([reaction, reactor]) => ({
    reaction,
    reactor
  }))
}

export async function p2pMessageToBaseMessage(input: BCP2pMessage): Promise<BaseMessage> {
  const account = await getCurrentAccount()

  const isMine = compareAddress(account.contractAddress, input.sender)

  return {
    content: input?.encryptedContent ?? input.finalContent ?? '',
    sender: input.sender,
    id: input.messageId,
    timestamp: +input.timestamp * 1000,
    isRead: input.isRead,
    isMine,
    reactions: p2pReactionToReactionItems({
      value: input.reactionSummary ?? '',
      me: account.contractAddress,
      partner: isMine ? input.recipient : input.sender
    })
  }
}

type Params2 = { reaction: string; reactor: string }[]

function groupReactionToReactionItems(value: Params2): ReactionItemData[] {
  const grouped = new Map<string, string[]>()

  for (let { reaction, reactor } of value) {
    reaction = decodeBase64(reaction)
    const reactors = grouped.get(reaction)

    if (reactors) {
      reactors.push(reactor)
    } else {
      grouped.set(reaction, [reactor])
    }
  }

  return Array.from(grouped, ([reaction, reactor]) => ({
    reaction,
    reactor
  }))
}
export async function groupMessageToBaseMessage(
  input: BCGroupMessage,
  isAnonymous?: boolean
): Promise<BaseMessage> {
  const account = await getCurrentAccount()
  console.log('input', input)
  return {
    content: input.finalContent,
    sender: isAnonymous ? input.authorAlias! : input.author,
    id: input.messageId,
    timestamp: +input.timestamp * 1000,
    isRead: input.readBy.some((i) => !compareAddress(i, account.address)),
    reactions: groupReactionToReactionItems(input.reactions)
  }
}

async function isMyMessage(message: BaseMessage, converstaion: BaseConversation) {
  const account = await getCurrentAccount()
  switch (converstaion.type) {
    case 'p2p':
      return compareAddress(message.sender, account.contractAddress)

    case 'group':
      return compareAddress(message.sender, account.address)

    case 'anonymous_group': {
      const alias = await getAlias(converstaion.id)
      return alias === message.sender
    }

    default:
      throw new Error('[isMyMessage] Invalid type')
  }
}

function baseMessageToStatus(input: BaseMessage) {
  if (input.isRead) return 'read'
  return 'delivered'
}

export async function baseMessageToMessage(
  base: BaseMessage,
  conversation: BaseConversation
): Promise<FulleMessage> {
  try {
    console.log('baseMessageToMessage 1')
    const account = await getCurrentAccount()
    console.log('baseMessageToMessage 2', account)

    const key = await getConversationKey(conversation)

    const { content, ...rest } = base
    console.log('baseMessageToMessage 3', { key, content, account, conversation })
    const decrypted = await decryptMessage(conversation, content, key, account)
    console.log('baseMessageToMessage 4', decrypted)

    return {
      ...rest,
      ...decrypted,
      isMine: await isMyMessage(base, conversation),
      status: baseMessageToStatus(base)
    }
  } catch (error) {
    console.error('baseMessageToMessage error', error)
    throw error
  }
}

export function fullMessageToData(input: FulleMessage) {
  const newData = {
    type: input.type
  }
  ;['content', 'fileId', 'stickerId', 'type'].forEach((key) => {
    const value = input[key]
    if (!!value) newData[key] = value
  })
  return newData
}

export async function getSender(base: BaseConversation) {
  switch (base.type) {
    case 'p2p':
      return (await getCurrentAccount()).contractAddress
    case 'group':
      return (await getCurrentAccount()).address
    case 'anonymous_group':
      return getAlias(base.id)
    default:
      throw new Error('[getSender] Invalid type')
  }
}
