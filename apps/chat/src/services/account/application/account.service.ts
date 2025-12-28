// src/services/account/application/account.service.ts

import type { AccountRepository } from '../domain/account.repository'
import type { Account } from '../domain/account.entity'

export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  async getAccounts(): Promise<Account[]> {
    return this.repository.getAll()
  }

  async getCurrentAccount(): Promise<Account | undefined> {
    return this.repository.getActive()
  }

  async getAccount(address: string): Promise<Account | undefined> {
    return this.repository.getByAddress(address)
  }

  async login(address: string): Promise<void> {
    const current = await this.repository.getActive()
    if (current && current.address !== address) {
      await this.repository.upsert({ ...current, isActive: false })
    }

    const account = await this.repository.getByAddress(address)
    if (!account) throw new Error('Account not found')

    await this.repository.upsert({ ...account, isActive: true })
  }

  async logout(): Promise<void> {
    const current = await this.repository.getActive()
    if (!current) return
    await this.repository.upsert({ ...current, isActive: false })
  }

  async switchAccount(address: string): Promise<void> {
    await this.login(address)
  }

  async addOrUpdateAccount(account: Account): Promise<void> {
    await this.repository.upsert(account)
  }

  async removeAccount(address: string): Promise<void> {
    await this.repository.delete(address)
  }

  async clearAccounts(): Promise<void> {
    await this.repository.clear()
  }
}
