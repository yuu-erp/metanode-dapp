import type { Account } from '../account'
import type { UserContract } from '../blockchain'
import type { WalletService } from '../wallet'
import { mapperToConversation } from './conversation.mapper'
import type { ConversationRepository } from './conversation.repository'
import type { Conversation } from './conversation.type'

export class ConversationService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly userContract: UserContract,
    private readonly walletService: WalletService
  ) {}

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------
  private async decryptLatestMessageContent(
    account: Account,
    encryptedMessage: string,
    conversationPublicKey: string
  ): Promise<string> {
    try {
      return await this.walletService.decryptMessage(
        conversationPublicKey,
        account.address,
        encryptedMessage
      )
    } catch {
      return await this.walletService.decryptMessage(
        account.publicKey,
        account.address,
        encryptedMessage
      )
    }
  }

  // ------------------------------------------------------------------
  // SYNC from blockchain → local DB (account-scoped)
  // ------------------------------------------------------------------
  async syncByAccount(account: Account): Promise<void> {
    const inbox = await this.userContract.getFullInbox({
      from: account.address,
      to: account.contractAddress
    })

    const conversations = await Promise.all(
      inbox.map(async (item) => {
        const conversationPublicKey = await this.userContract.publicKey({
          from: account.address,
          to: item.conversationId
        })

        const latestMessageContent = await this.decryptLatestMessageContent(
          account,
          item.latestMessageContent,
          conversationPublicKey
        )

        return mapperToConversation({
          ...item,
          accountId: account.address,
          publicKey: conversationPublicKey,
          latestMessageContent: JSON.stringify(latestMessageContent)
        })
      })
    )
    console.log('conversations', conversations)
    await this.repository.bulkUpsert(conversations)
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async getConversationById(
    accountId: string,
    conversationId: string
  ): Promise<Conversation | undefined> {
    return this.repository.getById(accountId, conversationId)
  }

  async getConversationList(accountId: string): Promise<Conversation[]> {
    return this.repository.getSortedByAccount(accountId)
  }

  // ------------------------------------------------------------------
  // CLEAR (logout / switch account)
  // ------------------------------------------------------------------
  async clearAccountData(accountId: string): Promise<void> {
    await this.repository.clearByAccount(accountId)
  }

  async updateConversation(account: Account, conversationId: string, encryptedContent: string) {
    // 1. Lấy conversation hiện tại
    const current = await this.repository.getById(account.address, conversationId)
    if (!current) return
    const decryptMessage = await this.walletService.decryptMessage(
      current.publicKey,
      account.address,
      encryptedContent
    )

    await this.repository.upsert({
      ...current,
      latestMessageContent: JSON.stringify(decryptMessage),
      updatedAt: new Date(Number(Math.floor(Date.now() / 1000)) * 1000)
    })
    console.log('decryptMessage', decryptMessage)
  }
}
