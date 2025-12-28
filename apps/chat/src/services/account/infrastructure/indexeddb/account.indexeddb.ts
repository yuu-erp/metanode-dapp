import Dexie, { type Table } from 'dexie'
import type { Account } from '../../domain'

export interface AccountDB extends Omit<Account, 'isActive'> {
  isActive: number
}

export class AccountDexieDB extends Dexie {
  accounts!: Table<AccountDB, string> // primary key là address

  constructor(dbName: string = 'account_db') {
    super(dbName)
    this.version(1).stores({
      accounts: 'address, isActive'
    })
  }
}
