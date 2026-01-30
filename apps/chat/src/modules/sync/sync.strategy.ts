import type { Account } from '@/modules/account'

export interface SyncStrategy {
  /**
   * Unique name of the strategy (e.g. 'conversation-sync', 'message-sync')
   */
  readonly name: string

  /**
   * Interval in milliseconds
   */
  readonly interval: number

  /**
   * Execute synchronization logic
   * @param account The account context to sync for
   */
  sync(account: Account): Promise<void>
}
