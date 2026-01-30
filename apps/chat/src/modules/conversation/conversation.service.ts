import type { Account } from '@/modules/account'
import type { UserContract } from '@/modules/blockchain'
import type { WalletService } from '@/modules/wallet'
import { fulfilledPromises } from '@/shared/utils'
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
    const conversations = await fulfilledPromises(
      inboxs.map(async (item) => {
        const [conversationPublicKey, userProfile] = await Promise.all([
          this.userContract.publicKey({
            from: account.address,
            to: item.conversationId
          }),
          this.userContract.userProfile({
            to: item.conversationId,
            from: account.address
          })
        ])

        const latestMessageContent = await this.decryptLatestMessageContent(
          account,
          item.latestMessageContent,
          conversationPublicKey
        )
        const existed = await this.repository.getById(account.address, item.conversationId)

        if (existed?.conversationType === 'private') {
          return {
            ...item,
            accountId: account.address,
            name: 'savedMessages',
            avatar: '',
            username: userProfile.userName,
            conversationType: 'private',
            publicKey: conversationPublicKey,
            unreadCount: 0,
            // @ts-ignore
            latestMessageContent:
              // @ts-ignore
              latestMessageContent.text ??
              // @ts-ignore
              latestMessageContent.value ??
              // @ts-ignore
              latestMessageContent.content ??
              ''
          }
        }

        return mapperToConversation({
          ...item,
          accountId: account.address,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          userName: userProfile.userName,
          avatar: userProfile.avatar,
          publicKey: conversationPublicKey,
          // @ts-ignore
          latestMessageContent:
            // @ts-ignore
            latestMessageContent.text ??
            // @ts-ignore
            latestMessageContent.value ??
            // @ts-ignore
            latestMessageContent.content ??
            ''
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
    const conversationLocal = await this.repository.getById(accountId, conversationId)
    if (conversationLocal) return conversationLocal
    console.log('getConversationById', {
      from: accountId,
      to: conversationId
    })
    const userProfile = await this.userContract.userProfile({
      from: accountId,
      to: conversationId
    })
    const publicKey = await this.userContract.publicKey({
      from: accountId,
      to: conversationId
    })
    const conversation = mapperToConversation({
      conversationId,
      accountId,
      publicKey,
      ...userProfile,
      conversationType: 'p2p'
    })
    await this.repository.upsert(conversation)
    return conversation
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
    console.log('[CONVERSATION SERVICE] - updateConversation - decryptMessage: ', decryptMessage)
    await this.repository.upsert({
      ...current,
      unreadCount: account.contractAddress === conversationId ? 0 : (current.unreadCount ?? 0) + 1,
      // @ts-ignore
      latestMessageContent: decryptMessage.value ?? decryptMessage.content ?? decryptMessage.text,
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
      name: 'savedMessages',
      avatar: '',
      username: account.username,
      conversationType: 'private',
      latestMessageContent: '',
      updatedAt: new Date(Number(Math.floor(Date.now() / 1000)) * 1000)
    })
  }

  // ------------------------------------------------------------------
  // GROUP (create / add membesr)
  // ------------------------------------------------------------------

  async createGroup() {}
}
