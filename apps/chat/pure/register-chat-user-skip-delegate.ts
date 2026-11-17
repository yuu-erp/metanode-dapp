import { detectNameFromWalletName, generateAvailableUsername } from '@/modules/account/utils'
import type { Wallet } from '@/modules/wallet'
import { container } from '@/container'
import type { WalletIdentityKind } from './utils/wallet-identity'

export type RegisterChatUserResult = {
  walletAddress: string
  contractAddress: string
  alreadyRegistered: boolean
  action: 'lookup' | 'register'
  identityKind?: WalletIdentityKind
}

/** Đã đăng ký → chỉ getUserContract; chưa → register (bỏ delegate — pure test). */
export async function resolveUserChatContract(
  wallet: Wallet,
  options?: { displayName?: string; identityKind?: WalletIdentityKind },
): Promise<RegisterChatUserResult> {
  const address = wallet.address
  const { factoryContract, walletService } = container

  const alreadyRegistered = await factoryContract.checkUserContract({
    from: address,
    inputData: { user: address },
  })

  if (alreadyRegistered) {
    const contractAddress = await factoryContract.getUserContract({
      from: address,
      inputData: { user: address },
    })
    if (!contractAddress) {
      throw new Error('Đã đăng ký nhưng không lấy được địa chỉ user contract')
    }
    return {
      walletAddress: address,
      contractAddress,
      alreadyRegistered: true,
      action: 'lookup',
      identityKind: options?.identityKind,
    }
  }

  if (options?.identityKind === 'address') {
    throw new Error(
      'User chưa đăng ký chat — cần private key (import ví) hoặc tạo ví mới, không chỉ địa chỉ',
    )
  }

  const publicKey = await walletService.getEncryptedPublicKey(address)

  const username = await generateAvailableUsername(
    wallet.name,
    address,
    factoryContract.isUsernameTaken.bind(factoryContract),
  )
  const { firstName, lastName } = detectNameFromWalletName(wallet.name)
  await factoryContract.registerUser({
    from: address,
    inputData: {
      publicKey,
      userName: username,
      firstName: options?.displayName ?? firstName,
      lastName,
      avatar: '',
      bio: '',
    },
  })

  const contractAddress = await factoryContract.getUserContract({
    from: address,
    inputData: { user: address },
  })

  if (!contractAddress) {
    throw new Error('User contract not found after register')
  }

  return {
    walletAddress: address,
    contractAddress,
    alreadyRegistered: false,
    action: 'register',
    identityKind: options?.identityKind,
  }
}

/** @deprecated dùng `resolveUserChatContract` */
export async function registerChatUserSkipDelegate(
  wallet: Wallet,
  displayName?: string,
): Promise<RegisterChatUserResult> {
  return resolveUserChatContract(wallet, { displayName })
}
