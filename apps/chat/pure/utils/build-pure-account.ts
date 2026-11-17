import { createAccount } from '@/modules/account/account.entity'
import type { Account } from '@/modules/account'
import { container } from '@/container'
import { getHiddenWallet } from '@metanodejs/system-core'

export async function buildPureAccount(
  walletAddress: string,
  userContractAddress: string,
): Promise<Account> {
  let hiddenAddress = walletAddress
  try {
    const hidden = await getHiddenWallet()
    if (hidden?.address) hiddenAddress = hidden.address
  } catch {
    // pure có thể không có hidden wallet
  }

  const publicKey = await container.walletService.getEncryptedPublicKey(walletAddress)

  let username = 'pure_user'
  let firstName = 'Pure'
  let lastName = 'Test'
  try {
    const profile = await container.userContract.userProfile({
      from: hiddenAddress,
      to: userContractAddress,
    })
    username = profile.userName || username
    firstName = profile.firstName || firstName
    lastName = profile.lastName || lastName
  } catch {
    // chưa có profile on-chain
  }

  return createAccount({
    address: walletAddress,
    contractAddress: userContractAddress,
    hiddenAddress,
    publicKey,
    name: `${firstName} ${lastName}`.trim(),
    username,
    firstName,
    lastName,
    avatar: '',
    bio: '',
  })
}
