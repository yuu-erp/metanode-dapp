import Dexie, { type Table } from 'dexie'
import type { Account } from '../../account.types'

export interface AccountDB extends Omit<Account, 'isActive'> {
  isActive: number
}

export class AccountDexieDB extends Dexie {
  accounts!: Table<AccountDB, string> // primary key là address

  constructor(dbName: string = 'accounts') {
    super(dbName)
    this.version(13)
      .stores({
        accounts: 'address, isActive'
      })
      .upgrade(async () => {})
  }
}
