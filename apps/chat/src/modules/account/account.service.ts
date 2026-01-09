import type { FactoryContract, UserContract } from '@/modules/blockchain'
import type { Wallet, WalletService } from '@/modules/wallet'
import { detectNameFromWalletName } from '@/shared/helpers'
import { generateAvailableUsername } from '@/shared/helpers/username-generator'
import { activateAccount, createAccount } from './account.entity'
import type { AccountRepository } from './account.repository'
import type { Account } from './account.types'

export class AccountService {
  constructor(
    private readonly walletService: WalletService,
    private readonly repository: AccountRepository,
    private readonly factoryContract: FactoryContract,
    private readonly userContract: UserContract
  ) {}

  async loadAccounts() {
    const accounts = await this.repository.getAll()
    return accounts
  }

  async getCurrentAccount(): Promise<Account | undefined> {
    const account = await this.repository.getActive()
    return account
  }

  async registerUser(wallet: Wallet): Promise<Account> {
    const address = wallet.address
    // 1. Check on-chain
    const isRegistered = await this.factoryContract.checkUserContract({
      from: address,
      inputData: {
        user: address
      }
    })
    // 3. Get public key
    const publicKey = await this.walletService.getEncryptedPublicKey(address)
    if (!isRegistered) {
      const username = await generateAvailableUsername(
        wallet.name,
        address,
        this.factoryContract.isUsernameTaken.bind(this.factoryContract)
      )

      const { firstName, lastName } = detectNameFromWalletName(wallet.name)

      await this.factoryContract.registerUser({
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
    const contractAddress = await this.factoryContract.getUserContract({
      from: address,
      inputData: {
        user: address
      }
    })
    if (!contractAddress) {
      throw new Error('User contract not found')
    }
    // 6. Lấy profile từ on-chain
    const profile = await this.userContract.userProfile({
      from: address,
      to: contractAddress
    })
    // 7. Sync xuống local
    const account: Account = createAccount({
      name: wallet.name,
      address,
      username: profile.userName,
      contractAddress,
      publicKey,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      bio: profile.bio
    })
    const activeAccount = activateAccount(account)
    await this.repository.upsert(activeAccount)
    await this.repository.setActive(address)
    return account
  }

  async logout(): Promise<void> {
    await this.repository.clearActive()
  }

  async checkUserContract(address: string): Promise<boolean> {
    return await this.factoryContract.checkUserContract({
      from: address,
      inputData: { user: address }
    })
  }
}
