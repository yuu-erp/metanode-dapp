import { AccountDexieDB } from './infrastructure/indexeddb/account.indexeddb'
import { DexieAccountRepository } from './infrastructure/indexeddb/dexie-account.repository'
import { AccountService } from './account.service'
import type { FactoryContract, UserContract } from '@/modules/blockchain'
import type { WalletService } from '@/modules/wallet'

export class AccountFactory {
  static createService(
    walletService: WalletService,
    factoryContract: FactoryContract,
    userContract: UserContract
  ): AccountService {
    const db = new AccountDexieDB('accounts')
    const repository = new DexieAccountRepository(db)
    return new AccountService(walletService, repository, factoryContract, userContract)
  }
}
