import type { Account } from '@/modules/account'
import type { SyncStrategy } from '@/modules/sync'
import type { ConversationService } from './conversation.service'

export class ConversationSyncStrategy implements SyncStrategy {
  public readonly name = 'conversation-sync'
  public readonly interval = 60_000 // 1 minute

  constructor(
    private readonly _service: ConversationService,
    private readonly _onSynced?: (account: Account) => void
  ) {}

  public async sync(account: Account): Promise<void> {
    console.log(`[ConversationSyncStrategy] Sync started for ${account.address}`)
    await this._service.syncByAccount(account)
    this._onSynced?.(account)
    console.log(`[ConversationSyncStrategy] Sync completed for ${account.address}`)
  }
}
