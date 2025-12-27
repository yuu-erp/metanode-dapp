import type { Account } from '@/interfaces'
import type { AccountRepository } from '@/repositories/account.repository'

export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  /** Lấy tất cả accounts */
  async getAccounts(): Promise<Account[]> {
    return this.repository.getAccounts()
  }

  /** Lấy account đang login */
  async getCurrentAccount(): Promise<Account | undefined> {
    return this.repository.getCurrentAccount()
  }

  /** Lấy account theo address */
  async getAccount(address: string): Promise<Account | undefined> {
    return this.repository.getAccountByAddress(address)
  }

  /** Thêm account mới */
  async addAccount(account: Account): Promise<void> {
    await this.repository.addAccount(account)
  }

  /** Cập nhật account */
  async updateAccount(address: string, partial: Partial<Account>): Promise<void> {
    await this.repository.updateAccount(address, partial)
  }

  /** Xoá account */
  async removeAccount(address: string): Promise<void> {
    await this.repository.removeAccount(address)
  }

  /** Login account (use-case rõ ràng) */
  async login(address: string): Promise<void> {
    const account = await this.repository.getAccountByAddress(address)
    if (!account) {
      throw new Error('Account not found')
    }

    await this.repository.updateAccount(address, { isLogin: true })
  }

  /** Logout account hiện tại */
  async logout(): Promise<void> {
    const current = await this.repository.getCurrentAccount()
    if (!current) return

    await this.repository.updateAccount(current.address, { isLogin: false })
  }

  /** Switch account (logout + login) */
  async switchAccount(address: string): Promise<void> {
    await this.login(address)
  }

  /** Đảm bảo luôn có account login (optional) */
  async ensureLoggedIn(): Promise<Account> {
    const current = await this.getCurrentAccount()
    if (current) return current

    const accounts = await this.getAccounts()
    if (accounts.length === 0) {
      throw new Error('No account available')
    }

    await this.login(accounts[0].address)
    return accounts[0]
  }
}
