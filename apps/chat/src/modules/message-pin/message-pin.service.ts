import type { Contracts } from '../blockchain/contracts'
import type { ConversationType } from '../conversation'
import type { Message } from '../message'
import { asyncPriorityQueue } from '../realtime'
import type { DexieMessagePinRepository } from './infrastructure/indexeddb/dexie-message-pin.repository'
import type { PinnedMessage } from './message-pin.entity'

export class MessagePinService {
  constructor(
    private readonly repository: DexieMessagePinRepository,
    private readonly contracts: Contracts
  ) {}

  private handlePinToServer(
    value: boolean,
    type: string,
    address: string,
    conversationId: string,
    messageId: string
  ) {
    if (type !== 'anonymous_group' && type !== 'group') return

    const contract = type === 'group' ? this.contracts.group : this.contracts.anonymousGroup

    return contract.pinMessage({
      from: address,
      to: conversationId,
      inputData: { isPinned: value, messageId }
    })
  }

  async pinMessage(
    accountId: string,
    conversationId: string,
    message: Message,
    type: ConversationType
  ): Promise<void> {
    // Ensure message has ID before pinning (though likely already persisted)
    if (!message.id) {
      throw new Error('Cannot pin a message without an ID')
    }

    const pinnedMessage: PinnedMessage = {
      accountId,
      conversationId,
      messageId: message.id,
      pinnedAt: Date.now(),
      message
    }
    await this.repository.pin(pinnedMessage)
    this.handlePinToServer(true, type, accountId, conversationId, message.id)
  }

  async unpinMessage(
    accountId: string,
    conversationId: string,
    messageId: string,
    type: ConversationType
  ): Promise<void> {
    await this.repository.unpin(accountId, conversationId, messageId)
    asyncPriorityQueue.add(() =>
      this.handlePinToServer(false, type, accountId, conversationId, messageId)
    )
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
