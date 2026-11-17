import { container } from '@/container'
import type { Account } from '@/modules/account'

export type PureGroupMemberInfo = {
  walletAddress: string
  userContract?: string
}

export type PureGroupSnapshot = {
  groupContract: string
  name: string
  avatar: string
  description: string
  memberCount: string
  admin: string
  onChainAdmin?: string
  isDeleted: boolean
  members: PureGroupMemberInfo[]
}

export async function fetchGroupSnapshot(
  account: Account,
  groupContract: string,
): Promise<PureGroupSnapshot> {
  const from = account.hiddenAddress
  const [info, members, admin] = await Promise.all([
    container.groupContract.getGroupInfo({ from, to: groupContract }),
    container.groupContract.getMemberListGroup({ from, to: groupContract }),
    container.groupContract.admin({ from, to: groupContract }),
  ])

  const membersDetail = await Promise.all(
    members.map(async (walletAddress) => {
      try {
        const userContract = await container.factoryContract.getUserContract({
          from,
          inputData: { user: walletAddress },
        })
        return { walletAddress, userContract }
      } catch {
        return { walletAddress }
      }
    }),
  )

  return {
    groupContract,
    name: info.name,
    avatar: info.avatar,
    description: info.description,
    memberCount: String(info.memberCount),
    admin: admin,
    onChainAdmin: info.groupAdmin,
    isDeleted: info.isDeleted,
    members: membersDetail,
  }
}
