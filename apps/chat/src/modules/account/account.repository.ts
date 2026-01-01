import type { Account } from './account.types'

export interface AccountRepository {
  getAll(): Promise<Account[]>

  getByAddress(address: string): Promise<Account | undefined>

  getActive(): Promise<Account | undefined>

  upsert(account: Account): Promise<void>

  setActive(address: string): Promise<void>

  delete(address: string): Promise<void>

  clear(): Promise<void>
}
