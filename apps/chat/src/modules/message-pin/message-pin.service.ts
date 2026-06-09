import type { Account } from '../account'
import type { Contracts } from '../blockchain/contracts'
import type { Conversation } from '../conversation'
import type { Message } from '../message'
import type { DexieMessagePinRepository } from './infrastructure/indexeddb/dexie-message-pin.repository'
import type { PinnedMessage } from './message-pin.entity'

export class MessagePinService {
  constructor(
    private readonly repository: DexieMessagePinRepository,
    readonly _contracts: Contracts
  ) {}

  async pinMessage(account: Account, conversation: Conversation, message: Message): Promise<void> {
    // Ensure message has ID before pinning (though likely already persisted)
    if (!message.id) {
      throw new Error('Cannot pin a message without an ID')
    }

    const pinnedMessage: PinnedMessage = {
      accountId: account.address,
      conversationId: conversation.conversationId,
      messageId: message.id,
      pinnedAt: Date.now(),
      message
    }
    await this.repository.pin(pinnedMessage)
  }

  async unpinMessage(
    account: Account,
    conversation: Conversation,
    messageId: string
  ): Promise<void> {
    await this.repository.unpin(account.address, conversation.conversationId, messageId)
  }

  async unpinAll(accountId: string, conversationId: string): Promise<void> {
    await this.repository.unpinAll(accountId, conversationId)
  }

  async getPinnedMessages(accountId: string, conversationId: string): Promise<PinnedMessage[]> {
    return this.repository.getAll(accountId, conversationId)
  }

  async isMessagePinned(
    accountId: string,
    conversationId: string,
    messageId: string
  ): Promise<boolean> {
    return this.repository.isPinned(accountId, conversationId, messageId)
  }
}
