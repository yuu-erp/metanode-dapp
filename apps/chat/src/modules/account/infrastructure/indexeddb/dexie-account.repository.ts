import type { AccountRepository } from '../../account.repository'
import type { Account } from '../../account.types'
import { AccountDexieDB, type AccountDB } from './account.indexeddb'

export class DexieAccountRepository implements AccountRepository {
  constructor(private readonly db: AccountDexieDB) {}

  private fromDB(dbAccount: AccountDB): Account {
    return { ...dbAccount, isActive: dbAccount.isActive === 1 }
  }

  private toDB(account: Account): AccountDB {
    return { ...account, isActive: account.isActive ? 1 : 0 }
  }

  async getAll(): Promise<Account[]> {
    const accounts = await this.db.accounts.toArray()
    return accounts.map(this.fromDB)
  }

  async getByAddress(address: string): Promise<Account | undefined> {
    const account = await this.db.accounts.get(address)
    return account ? this.fromDB(account) : undefined
  }

  async getActive(): Promise<Account | undefined> {
    const account = await this.db.accounts.where('isActive').equals(1).first()
    return account ? this.fromDB(account) : undefined
  }

  async upsert(account: Account) {
    await this.db.accounts.put(this.toDB(account))
  }

  async setActive(address: string): Promise<void> {
    // 1. Reset tất cả isActive về 0
    await this.db.accounts.toCollection().modify({ isActive: 0 })

    // 2. Lấy account theo address
    const dbAccount = await this.db.accounts.get(address)
    if (!dbAccount) throw new Error('Account not found')

    // 3. Set isActive = 1
    await this.db.accounts.put({ ...dbAccount, isActive: 1 })
  }

  async delete(address: string) {
    return this.db.accounts.delete(address)
  }

  async clear() {
    return this.db.accounts.clear()
  }
}
