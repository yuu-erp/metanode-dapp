import { container } from '@/container'
import type { Account } from '@/modules/account'
import type { PayloadAddMembers } from '@/modules/conversation'
import { compareAddress } from '@/shared/lib'
import { isValidEthAddress, normalizeEthAddress } from './wallet-identity'

/** Member input: địa chỉ ví hoặc user contract → wallet + user contract + publicKey. */
export async function resolveMemberReference(
  account: Account,
  memberInput: string,
): Promise<{
  walletAddress: string
  userContract: string
  publicKey: string
  forAdd: PayloadAddMembers
}> {
  const raw = memberInput.trim()
  if (!isValidEthAddress(raw)) {
    throw new Error('Member: nhập địa chỉ ví hoặc user contract (40 hex)')
  }

  let walletAddress = ''
  let userContract = ''

  const normalized = normalizeEthAddress(raw)

  try {
    const owner = await container.userContract.owner({
      from: account.hiddenAddress,
      to: normalized,
    })
    if (owner && isValidEthAddress(owner)) {
      userContract = normalized
      walletAddress = normalizeEthAddress(owner)
    }
  } catch {
    // không phải user contract
  }

  if (!userContract) {
    walletAddress = normalized
    userContract = await container.factoryContract.getUserContract({
      from: account.hiddenAddress,
      inputData: { user: walletAddress },
    })
    if (!userContract) {
      throw new Error('Không tìm user contract cho ví — member chưa đăng ký chat?')
    }
  } else {
    const fromFactory = await container.factoryContract.getUserContract({
      from: account.hiddenAddress,
      inputData: { user: walletAddress },
    })
    if (fromFactory && !compareAddress(fromFactory, userContract)) {
      userContract = fromFactory
    }
  }

  const publicKey = await container.userContract.publicKey({
    from: account.hiddenAddress,
    to: userContract,
  })

  return {
    walletAddress,
    userContract,
    publicKey,
    forAdd: { conversationId: userContract, publicKey },
  }
}
