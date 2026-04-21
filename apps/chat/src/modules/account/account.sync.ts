import type { Account } from '@/modules/account'
import type { SyncStrategy } from '@/modules/sync'
import type { AccountService } from './account.service'

export class AccountSyncStrategy implements SyncStrategy {
  public readonly name = 'account-sync'
  public readonly interval = 30 * 60 * 1000 // 30 minutes

  constructor(private readonly _service: AccountService) {}

  public async sync(account: Account): Promise<void> {
    await this._service.syncByRegisterMeeting(account)
  }
}
