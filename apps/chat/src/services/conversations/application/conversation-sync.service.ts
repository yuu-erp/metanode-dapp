import type { Conversation, ConversationRepository } from '../domain'
import type { ConversationSyncProvider } from './conversation-sync.provider'

export class ConversationSyncService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly provider: ConversationSyncProvider
  ) {}

  /**
   * Sync conversations from remote source
   * (Indexer / blockchain)
   */
  async sync(): Promise<Conversation[]> {
    const remoteConversations = await this.provider.fetch()

    if (!remoteConversations.length) {
      return this.repository.getAllSorted()
    }

    await this.repository.bulkUpsert(remoteConversations)

    return this.repository.getAllSorted()
  }
}
