import type { UserConversationService } from '@/infrastructure/blockchain/user'
import type { SecurityRepository } from '@/infrastructure/security'
import type { ConversationSyncProvider } from '@/services/conversations/application'
import type { Conversation } from '@/services/conversations/domain'
import { mapToConversation } from '../conversation.mapper'
import type { Account } from '@/services/account/domain'

export class BlockchainConversationProvider implements ConversationSyncProvider {
  constructor(
    private readonly contract: UserConversationService,
    private readonly account: Account,
    private readonly messageSecurity: SecurityRepository
  ) {}

  private async decryptLatestMessageContent(publicKey: string, content: string) {
    try {
      const latestMessageContent = await this.messageSecurity.decryptAesECDH(
        publicKey,
        this.account.address,
        content
      )
      return latestMessageContent
    } catch (error) {
      const latestMessageContent = await this.messageSecurity.decryptAesECDH(
        this.account.publicKey,
        this.account.address,
        content
      )
      return latestMessageContent
    }
  }

  async fetch(): Promise<Conversation[]> {
    const raw = await this.contract.getFullInbox(this.account.address, this.account.contractAddress)
    return Promise.all(
      raw.map(async (item) => {
        const publicKey = await this.contract.publicKey(this.account.address, item.conversationId)
        const latestMessageContent = await this.decryptLatestMessageContent(
          publicKey,
          item.latestMessageContent
        )
        return mapToConversation({
          ...item,
          publicKey,
          // @ts-ignore
          latestMessageContent: latestMessageContent.text
        })
      })
    )
  }
}
