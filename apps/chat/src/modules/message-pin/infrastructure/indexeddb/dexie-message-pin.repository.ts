import type { MessagePinDB } from './message-pin.indexeddb'
import type { PinnedMessage } from '../../message-pin.entity'

export class DexieMessagePinRepository {
  constructor(private readonly db: MessagePinDB) {}

  async pin(pinnedMessage: PinnedMessage): Promise<void> {
    await this.db.pinnedMessages.put(pinnedMessage)
  }

  async unpin(accountId: string, conversationId: string, messageId: string): Promise<void> {
    await this.db.pinnedMessages
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .filter((msg) => msg.messageId === messageId)
      .delete()
  }

  async unpinAll(accountId: string, conversationId: string): Promise<void> {
    await this.db.pinnedMessages
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .delete()
  }

  async getAll(accountId: string, conversationId: string): Promise<PinnedMessage[]> {
    return this.db.pinnedMessages
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .reverse()
      .sortBy('pinnedAt')
  }

  async isPinned(accountId: string, conversationId: string, messageId: string): Promise<boolean> {
    const count = await this.db.pinnedMessages
      .where('[accountId+conversationId]')
      .equals([accountId, conversationId])
      .filter((msg) => msg.messageId === messageId)
      .count()
    return count > 0
  }
}
