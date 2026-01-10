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
    const inboxs = await this.userContract.getFullInbox({
      from: account.address,
      to: account.contractAddress
    })

    const conversations = await Promise.all(
      inboxs.map(async (item) => {
        const conversationPublicKey = await this.userContract.publicKey({
          from: account.address,
          to: item.conversationId
        })

        const userProfile = await this.userContract.userProfile({
          to: item.conversationId,
          from: account.address
        })

        const latestMessageContent = await this.decryptLatestMessageContent(
          account,
          item.latestMessageContent,
          conversationPublicKey
        )

        const existed = await this.repository.getById(account.address, item.conversationId)

        if (existed?.conversationType === 'private') {
          return {
            ...item,
            name: 'Saved Messages',
            avatar: '',
            username: userProfile.userName,
            conversationType: 'private',
            accountId: account.address,
            publicKey: conversationPublicKey,
            unreadCount: 0,
            // @ts-ignore
            latestMessageContent: latestMessageContent.text
          }
        }

        return mapperToConversation({
          ...item,
          userName: userProfile.userName,
          accountId: account.address,
          publicKey: conversationPublicKey,
          // @ts-ignore
          latestMessageContent: latestMessageContent.text
        })
      })
    )

    await this.repository.bulkUpsert(conversations.filter(Boolean) as Conversation[])
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

    if (!current) {
      // Chưa có hàm lấy thông tin của user bằng contract address nên tạm thời fetch lại toàn bộ danh sách nhắn tin
      await this.syncByAccount(account)
      return
    }
    const decryptMessage = await this.walletService.decryptMessage(
      current.publicKey,
      account.address,
      encryptedContent
    )

    await this.repository.upsert({
      ...current,
      unreadCount: (current.unreadCount ?? 0) + 1,
      // @ts-ignore
      latestMessageContent: decryptMessage.text,
      updatedAt: new Date(Number(Math.floor(Date.now() / 1000)) * 1000)
    })
  }

  async createPrivateConversation(account: Account) {
    const current = await this.repository.getById(account.address, account.contractAddress)
    if (current) return
    await this.repository.upsert({
      conversationId: account.contractAddress,
      publicKey: account.publicKey,
      accountId: account.address,
      name: 'Saved Messages',
      avatar: '',
      username: account.username,
      conversationType: 'private',
      latestMessageContent: '',
      updatedAt: new Date(Number(Math.floor(Date.now() / 1000)) * 1000)
    })
  }
}
