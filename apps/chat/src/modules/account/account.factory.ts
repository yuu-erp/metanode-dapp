import type { FactoryContract, UserContract } from '@/modules/blockchain'
import type { WalletService } from '@/modules/wallet'
import { AccountService } from './account.service'
import { AccountDexieDB } from './infrastructure/indexeddb/account.indexeddb'
import { DexieAccountRepository } from './infrastructure/indexeddb/dexie-account.repository'
import type { EventLogContainer } from '../eventlogs'

export class AccountFactory {
  static createService(
    walletService: WalletService,
    factoryContract: FactoryContract,
    userContract: UserContract,
    eventLog: EventLogContainer
  ): AccountService {
    const db = new AccountDexieDB('accounts')
    const repository = new DexieAccountRepository(db)
    return new AccountService(walletService, repository, factoryContract, userContract, eventLog)
  }
}
