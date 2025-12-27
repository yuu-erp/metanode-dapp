import type { Account } from '@/interfaces'
import { getAllWallets } from '@metanodejs/system-core'

export class AccountRepository {
  private readonly key = 'accounts'

  /** Read từ localStorage */
  private read(): Account[] {
    const raw = localStorage.getItem(this.key)
    if (!raw) return []

    try {
      return JSON.parse(raw) as Account[]
    } catch {
      return []
    }
  }

  /** Write vào localStorage */
  private write(accounts: Account[]): void {
    localStorage.setItem(this.key, JSON.stringify(accounts))
  }

  async getAccounts(): Promise<Account[]> {
    return this.read()
  }

  async getAccountByAddress(address: string): Promise<Account | undefined> {
    return this.read().find((acc) => acc.address === address)
  }

  async getCurrentAccount(): Promise<Account | undefined> {
    return this.read().find((acc) => acc.isLogin)
  }

  /** Kiểm tra ví có tồn tại trong native system */
  private async walletExists(address: string): Promise<boolean> {
    const wallets = await getAllWallets()
    return wallets.some((w) => w.address === address)
  }

  private normalizeLoginState(accounts: Account[], loginAddress?: string): Account[] {
    if (!loginAddress) return accounts

    return accounts.map((acc) => ({
      ...acc,
      isLogin: acc.address === loginAddress
    }))
  }

  async addAccount(account: Account): Promise<void> {
    if (!(await this.walletExists(account.address))) {
      throw new Error('Wallet does not exist in native system')
    }

    let accounts = this.read()
    if (accounts.some((acc) => acc.address === account.address)) {
      throw new Error('Account already exists')
    }

    accounts.push(account)

    if (account.isLogin) {
      accounts = this.normalizeLoginState(accounts, account.address)
    }

    this.write(accounts)
  }

  async updateAccount(address: string, partial: Partial<Account>): Promise<void> {
    if (!(await this.walletExists(address))) {
      throw new Error('Wallet does not exist in native system')
    }

    let accounts = this.read()
    const index = accounts.findIndex((acc) => acc.address === address)

    if (index === -1) {
      throw new Error('Account not found')
    }

    accounts[index] = { ...accounts[index], ...partial }

    if (partial.isLogin === true) {
      accounts = this.normalizeLoginState(accounts, address)
    }

    this.write(accounts)
  }

  async removeAccount(address: string): Promise<void> {
    this.write(this.read().filter((acc) => acc.address !== address))
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key)
  }
}
