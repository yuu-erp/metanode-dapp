import type { Account } from '@/interfaces'
import { AbstractMessage } from './abstract-message'

export class Message extends AbstractMessage {
  constructor(account: Account) {
    super(account)
  }
  async sendMessage() {
    const contract = this.requireReceiver()
    // logic gửi message tới contract
  }
}
