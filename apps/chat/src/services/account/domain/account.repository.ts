// src/services/account/account.repository.ts

import type { Account } from './account.entity'

export interface AccountRepository {
  getAll(): Promise<Account[]>

  getByAddress(address: string): Promise<Account | undefined>

  getActive(): Promise<Account | undefined>

  upsert(account: Account): Promise<void>

  setActive(address: string): Promise<void>

  delete(address: string): Promise<void>

  clear(): Promise<void>
}
