import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { ConversationType } from '@/modules/conversation'
import type { GetFullInboxOutput } from '@/modules/blockchain/user-contract/types'
import { applyPureChatIdentity } from './apply-pure-chat-identity'
import { buildPureAccount } from './build-pure-account'
import { fetchConversationListFromContract } from './fetch-conversation-list'
import { decryptMessageForAccount, encryptMessageForAccount } from './message-crypto-pure'
import {
  findConversationInInbox,
  toSendBaseConversation,
  type ResolvedInboxConversation,
} from './resolve-conversation-target'
import { uploadFileForPureSend } from './upload-file-pure'
import type { RegisterChatUserResult } from '../register-chat-user-skip-delegate'

export type PureTextMessagePayload = {
  type: 'text'
  content: string
}

export type PureFileMessagePayload = {
  type: 'file'
  content: string
  fileIds: string[]
  fileId: string
}

function buildTextPayload(content: string): PureTextMessagePayload {
  const value = content.trim()
  if (!value) throw new Error('Nội dung tin nhắn trống')
  return { type: 'text', content: value }
}

/** On-chain key sau upload — giống `handleSendMessage` + `submit-chat-input` (`fileIds`). */
function buildFilePayload(fileKey: string, caption?: string): PureFileMessagePayload {
  const key = fileKey.trim()
  if (!key) throw new Error('File key trống')
  return {
    type: 'file',
    content: (caption ?? '').trim(),
    fileIds: [key],
    fileId: key,
  }
}

async function getGroupMemberListPure(account: Account, groupContract: string) {
  return container.groupContract.getMemberListGroup({
    from: account.hiddenAddress,
    to: groupContract,
  })
}

async function getUserContractAddressPure(account: Account, userAddress: string) {
  return container.factoryContract.getUserContract({
    from: account.hiddenAddress,
    inputData: { user: userAddress },
  })
}

async function sendMessageOnChain(
  account: Account,
  base: BaseConversation,
  encryptedMessage: string,
  conversationType: ConversationType,
) {
  switch (conversationType) {
    case 'p2p':
    case 'private': {
      const recipient = conversationType === 'private' ? account.contractAddress : base.id
      return container.userContract.sendMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: {
          _recipientContractAddress: recipient,
          _encryptedContentForRecipient: encryptedMessage,
          _encryptedContentForSelf: encryptedMessage,
        },
      })
    }
    case 'group': {
      const memberList = await getGroupMemberListPure(account, base.id)
      const data = await Promise.all(
        memberList.map(async (mem) => {
          const contractAddress = await getUserContractAddressPure(account, mem)
          const settings = await container.userContract.detailedSettings({
            from: account.hiddenAddress,
            to: contractAddress,
          })
          return { ...settings, contractAddress, address: mem }
        }),
      )
      const enabledUsers = data.filter((i) => i.p2pChatEnabled)
      return container.groupContract.sendMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: {
          encryptedContent: encryptedMessage,
          recipientContracts: enabledUsers.map((i) => i.contractAddress),
          recipientOwners: enabledUsers.map((i) => i.address),
        },
      })
    }
    case 'anonymous_group': {
      return container.anonymousGroupContract.sendMessage({
        from: account.hiddenAddress,
        to: base.id,
        inputData: { encryptedContent: encryptedMessage },
      })
    }
    default:
      throw new Error(`[pure] send không hỗ trợ conversationType: ${conversationType}`)
  }
}

type PureSendContext = {
  account: Account
  contract: RegisterChatUserResult
  target: ResolvedInboxConversation
  base: BaseConversation
}

async function resolvePureSendContext(
  identityInput: string,
  conversationId: string,
): Promise<PureSendContext> {
  const { contract } = await applyPureChatIdentity(identityInput)
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)

  const inbox = await fetchConversationListFromContract({
    walletAddress: contract.walletAddress,
    userContractAddress: contract.contractAddress,
  })

  const target = findConversationInInbox(inbox, conversationId)
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

async function pureSendWithContext(
  context: PureSendContext,
  payload: PureTextMessagePayload | PureFileMessagePayload,
) {
  const { account, target, base } = context

  const conversationKey = await container.conversationService.getConversationKey(base, account)
  const encryptedMessage = await encryptMessageForAccount(payload, conversationKey, base, account)

  const decryptedRoundTrip = await decryptMessageForAccount(
    base,
    encryptedMessage,
    conversationKey,
    account,
  )

  const txResult = await sendMessageOnChain(
    account,
    base,
    encryptedMessage,
    target.conversationType,
  )

  return {
    payload,
    conversationType: target.conversationType,
    base,
    conversationKeyPreview: `${String(conversationKey).slice(0, 12)}…`,
    encryptedPreview: `${encryptedMessage.slice(0, 48)}…`,
    decryptedRoundTrip,
    txResult,
  }
}

async function pureSendMessagePayload(options: {
  identityInput: string
  conversationId: string
  payload: PureTextMessagePayload | PureFileMessagePayload
}) {
  const context = await resolvePureSendContext(options.identityInput, options.conversationId)
  return pureSendWithContext(context, options.payload)
}

export async function pureSendTextMessage(options: {
  identityInput: string
  conversationId: string
  content: string
}) {
  return pureSendMessagePayload({
    identityInput: options.identityInput,
    conversationId: options.conversationId,
    payload: buildTextPayload(options.content),
  })
}

/** Gửi khi đã biết `conversationId` + type (ví dụ P2P lần đầu — chưa có trong inbox). */
export async function pureSendTextForKnownTarget(options: {
  identityInput: string
  conversationId: string
  conversationType: ConversationType
  content: string
}) {
  const { contract } = await applyPureChatIdentity(options.identityInput)
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)
  const base = toSendBaseConversation(
    options.conversationType,
    options.conversationId,
    contract.contractAddress,
  )
  const target: ResolvedInboxConversation = {
    conversationId: options.conversationId,
    conversationType: options.conversationType,
    inboxItem: {} as GetFullInboxOutput,
  }
  return pureSendWithContext({ account, contract, target, base }, buildTextPayload(options.content))
}

export async function pureSendFileMessage(options: {
  identityInput: string
  conversationId: string
  fileKey: string
  caption?: string
}) {
  return pureSendMessagePayload({
    identityInput: options.identityInput,
    conversationId: options.conversationId,
    payload: buildFilePayload(options.fileKey, options.caption),
  })
}

async function pureSendFileWithUploadOnContext(
  context: PureSendContext,
  file: File,
  caption?: string,
) {
  const fileKey = await uploadFileForPureSend(context.account, file)
  const sendResult = await pureSendWithContext(context, buildFilePayload(fileKey, caption))
  return {
    upload: {
      fileKey,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
    },
    ...sendResult,
  }
}

/** Chọn file → upload (`file-module`) → gửi message file như app. */
export async function pureSendFileWithUpload(options: {
  identityInput: string
  conversationId: string
  file: File
  caption?: string
}) {
  const context = await resolvePureSendContext(options.identityInput, options.conversationId)
  return pureSendFileWithUploadOnContext(context, options.file, options.caption)
}

/** Upload + gửi khi đã biết conversationId + type (E2E / chưa có trong inbox). */
export async function pureSendFileWithUploadForKnownTarget(options: {
  identityInput: string
  conversationId: string
  conversationType: ConversationType
  file: File
  caption?: string
}) {
  const { contract } = await applyPureChatIdentity(options.identityInput)
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)
  const base = toSendBaseConversation(
    options.conversationType,
    options.conversationId,
    contract.contractAddress,
  )
  const target: ResolvedInboxConversation = {
    conversationId: options.conversationId,
    conversationType: options.conversationType,
    inboxItem: {} as GetFullInboxOutput,
  }
  const context: PureSendContext = { account, contract, target, base }
  return pureSendFileWithUploadOnContext(context, options.file, options.caption)
}
