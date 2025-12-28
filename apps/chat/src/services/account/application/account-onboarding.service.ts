import type { FactoryContractService } from '@/infrastructure/blockchain/factory'
import type { UserConversationService } from '@/infrastructure/blockchain/user'
import { type Wallet, type WalletService } from '@/services/wallets'
import { detectNameFromWalletName, generateAvailableUsername } from '@/shared/helpers'
import type { Account, AccountRepository } from '../domain'

export class AccountOnboardingService {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly walletService: WalletService,
    private readonly factoryContractService: FactoryContractService,
    private readonly userContractService: UserConversationService
  ) {}

  async registerOrLogin(wallet: Wallet): Promise<Account> {
    const address = wallet.address

    // 1. Check on-chain
    const isRegistered = await this.factoryContractService.checkUserContract(address)

    // 2. Check local
    const localAccount = await this.accountRepo.getByAddress(address)

    // 3. Get public key
    const publicKey = await this.walletService.getEncryptedPublicKey(address)

    // 4. Nếu chưa đăng ký → đăng ký trên-chain
    if (!isRegistered) {
      const username = await generateAvailableUsername(
        wallet.name,
        address,
        this.factoryContractService.isUsernameTaken.bind(this.factoryContractService)
      )

      const { firstName, lastName } = detectNameFromWalletName(wallet.name)

      await this.factoryContractService.registerUser({
        from: address,
        inputData: {
          publicKey,
          userName: username,
          firstName,
          lastName,
          avatar: '',
          bio: ''
        }
      })
    }

    // 5. Lấy user contract address (luôn làm)
    const contractAddress = await this.factoryContractService.getUserContract(address)
    if (!contractAddress) {
      throw new Error('User contract not found')
    }

    // 6. Lấy profile từ on-chain
    const profile = await this.userContractService.userProfile(address, contractAddress)

    // 7. Sync xuống local
    const account: Account = {
      name: wallet.name,
      address,
      username: profile.userName,
      contractAddress,
      publicKey,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      bio: profile.bio,
      isActive: true,
      isRegistered: true
    }

    if (!localAccount) {
      // Chưa có → insert và set active
      await this.accountRepo.upsert(account)
      await this.accountRepo.setActive(address)
    } else {
      // Đã có → merge và upsert
      await this.accountRepo.upsert({
        ...localAccount,
        ...account // ghi đè các thông tin mới từ on-chain
      })
      await this.accountRepo.setActive(address)
    }

    return account
  }
}
