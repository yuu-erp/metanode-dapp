import type { Account } from '@/interfaces'

export abstract class AbstractMessage {
  readonly account: Account
  protected receiverContract?: string

  protected constructor(account: Account) {
    this.account = account
  }

  /** Đổi người chat / channel */
  setReceiverContract(contract: string): this {
    this.receiverContract = contract
    return this
  }

  /** Dùng trước khi send */
  protected requireReceiver(): string {
    if (!this.receiverContract) {
      throw new Error('Receiver contract is not set')
    }
    return this.receiverContract
  }
}
