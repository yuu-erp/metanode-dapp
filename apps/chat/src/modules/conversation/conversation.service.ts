import type { Account } from '../account/account.types'
import type { UserContract } from '../blockchain'
import type { WalletService } from '../wallet'
import { mapperToConversation } from './conversation.mapper'
import type { ConversationRepository } from './conversation.repository'
import type { Conversation } from './conversation.type'

export class ConversationService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly useContract: UserContract,
    private readonly walletService: WalletService
  ) {}

  private async decryptLatestMessageContent(
    account: Account,
    message: string,
    publicKeyConversation: string
  ) {
    try {
      return await this.walletService.decryptMessage(
        publicKeyConversation,
        account.address,
        message
      )
    } catch (error) {
      return await this.walletService.decryptMessage(account.publicKey, account.address, message)
    }
  }

  async fetchConversationSync(account: Account): Promise<Conversation[]> {
    const raw = await this.useContract.getFullInbox({
      from: account.address,
      to: account.contractAddress
    })

    return Promise.all(
      raw.map(async (item) => {
        const publicKey = await this.useContract.publicKey({
          from: account.address,
          to: item.conversationId
        })
        const latestMessageContent = await this.decryptLatestMessageContent(
          account,
          item.latestMessageContent,
          publicKey
        )
        return mapperToConversation({
          ...item,
          publicKey,
          latestMessageContent: JSON.stringify(latestMessageContent)
        })
      })
    )
  }

  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    return this.repository.getById(conversationId)
  }

  async loadInitial(): Promise<Conversation[]> {
    return this.repository.getAllSorted()
  }
}
