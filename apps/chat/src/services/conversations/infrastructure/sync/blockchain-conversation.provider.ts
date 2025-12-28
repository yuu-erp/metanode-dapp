import type { ConversationSyncProvider } from '@/services/conversations/application'
import type { Conversation } from '@/services/conversations/domain'
import type { UserConversationService } from '@/infrastructure/blockchain/user'
import { mapToConversation } from '../conversation.mapper'

export class BlockchainConversationProvider implements ConversationSyncProvider {
  constructor(
    private readonly contract: UserConversationService,
    private readonly walletAddress: string,
    private readonly contractAddress: string
  ) {}

  async fetch(): Promise<Conversation[]> {
    const raw = await this.contract.getFullInbox(this.walletAddress, this.contractAddress)
    return raw.map(mapToConversation)
  }
}
