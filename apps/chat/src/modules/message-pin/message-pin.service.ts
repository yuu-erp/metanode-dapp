import type { DexieMessagePinRepository } from './infrastructure/indexeddb/dexie-message-pin.repository'
import type { Message } from '../message'
import type { PinnedMessage } from './message-pin.entity'

export class MessagePinService {
  constructor(private readonly repository: DexieMessagePinRepository) {}

  async pinMessage(accountId: string, conversationId: string, message: Message): Promise<void> {
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
  }

  async unpinMessage(accountId: string, conversationId: string, messageId: string): Promise<void> {
    await this.repository.unpin(accountId, conversationId, messageId)
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
