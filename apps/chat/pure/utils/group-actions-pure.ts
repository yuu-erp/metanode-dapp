import { container } from '@/container'
import type { Account } from '@/modules/account'
import { HistoryVisibility, type PayloadCreateGroup } from '@/modules/conversation'
import { applyPureChatIdentity } from './apply-pure-chat-identity'
import { buildPureAccount } from './build-pure-account'
import { fetchGroupSnapshot } from './fetch-group-snapshot'
import { resolveMemberReference } from './resolve-member-ref'
import { isValidEthAddress, normalizeEthAddress } from './wallet-identity'

async function accountFromIdentity(identityInput: string) {
  const { contract } = await applyPureChatIdentity(identityInput)
  const account = await buildPureAccount(contract.walletAddress, contract.contractAddress)
  return { account, contract }
}

function parseGroupContract(groupInput: string) {
  const id = groupInput.trim()
  if (!isValidEthAddress(id)) throw new Error('group contract không hợp lệ')
  return normalizeEthAddress(id)
}

export function randomPureGroupName(prefix = 'Pure') {
  const token = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${token}-${Date.now()}`
}

export async function pureCreateGroup(options: { identityInput: string; name?: string }) {
  const name = options.name?.trim() || randomPureGroupName()

  const { account } = await accountFromIdentity(options.identityInput)
  const payload: PayloadCreateGroup = {
    name,
    avatar: '',
    policy: HistoryVisibility.VISIBLE,
    members: [],
  }

  const created = await container.conversationService.createGroup(account, payload)
  const groupContract = created.contractAddress
  const group = await fetchGroupSnapshot(account, groupContract)

  return {
    created,
    groupKey: created.groupKey,
    group,
  }
}

export async function pureAddGroupMember(options: {
  identityInput: string
  groupContract: string
  memberInput: string
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const groupContract = parseGroupContract(options.groupContract)
  const member = await resolveMemberReference(account, options.memberInput)

  const groupKey = await container.conversationService.getConversationKey(
    { id: groupContract, type: 'group' },
    account,
  )

  await container.conversationService.addMembers(account, groupContract, groupKey, [member.forAdd])

  const group = await fetchGroupSnapshot(account, groupContract)
  return { member, groupKeyPreview: `${String(groupKey).slice(0, 12)}…`, group }
}

export async function pureRemoveGroupMember(options: {
  identityInput: string
  groupContract: string
  memberInput: string
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const groupContract = parseGroupContract(options.groupContract)
  const member = await resolveMemberReference(account, options.memberInput)

  await container.groupContract.removeMember({
    from: account.hiddenAddress,
    to: groupContract,
    inputData: { user: member.walletAddress },
  })

  const group = await fetchGroupSnapshot(account, groupContract)
  return { removed: member.walletAddress, group }
}

export async function pureTransferGroupAdmin(options: {
  identityInput: string
  groupContract: string
  memberInput: string
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const groupContract = parseGroupContract(options.groupContract)
  const member = await resolveMemberReference(account, options.memberInput)

  const pubKey = await container.userContract.publicKey({
    from: account.hiddenAddress,
    to: member.userContract,
  })

  await container.groupContract.transferAdmin({
    from: account.hiddenAddress,
    to: groupContract,
    inputData: {
      newAdmin: member.walletAddress,
      _newPublicKeyAdmin: pubKey,
    },
  })

  const group = await fetchGroupSnapshot(account, groupContract)
  return {
    newAdmin: member.walletAddress,
    newAdminPublicKeyPreview: `${pubKey.slice(0, 16)}…`,
    group,
  }
}

export async function pureFetchGroupInfo(options: {
  identityInput: string
  groupContract: string
}) {
  const { account } = await accountFromIdentity(options.identityInput)
  const groupContract = parseGroupContract(options.groupContract)
  const group = await fetchGroupSnapshot(account, groupContract)
  return { group }
}
