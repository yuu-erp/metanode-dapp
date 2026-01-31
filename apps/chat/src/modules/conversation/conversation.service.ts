import type { Account } from '@/modules/account'
import type { UserContract } from '@/modules/blockchain'
import { mapperToMessage, type Message, type OnChainMessagePayload } from '@/modules/message'
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
  private async decryptLatestMessageContent<T = OnChainMessagePayload>(
    account: Account,
    encryptedMessage: string,
    conversationPublicKey: string
  ): Promise<T> {
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
    console.log('KHAIHOAN DEBUG CONVERSATION SERVICE ---- inboxs', inboxs)
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

        const lastMessageDecrypted = await this.decryptLatestMessageContent(
          account,
          item.latestMessageContent,
          conversationPublicKey
        )
        // Ideally, we should fetch the FULL message object if we want PersistedMessage.
        // But for list view, maybe we construct a partial one or the mapper handles it.
        // Let's assume we pass the decrypted content into the mapper via a specific field or constructed object.

        return mapperToConversation({
          ...item,
          accountId: account.address,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          userName: userProfile.userName,
          name: item.conversationId === account.contractAddress && 'savedMessages',
          avatar: userProfile.avatar,
          publicKey: conversationPublicKey,
          updatedAt: new Date(item.latestMessageTimestamp),
          conversationType:
            item.conversationId === account.contractAddress ? 'private' : item.conversationType,
          // Construct a fake object that mapperToMessage can parse
          lastMessage: mapperToMessage({
            accountId: account.address,
            conversationId: item.conversationId,
            timestamp: item.latestMessageTimestamp,
            ...lastMessageDecrypted
          })
        })
      })
    )
    console.log('KHAIHOAN DEBUG CONVERSATION SERVICE ---- conversations', conversations)
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

  async updateWithLastMessage(message: Message) {
    const current = await this.repository.getById(message.accountId, message.conversationId)
    // Nếu chưa có conversation -> sync lại hoặc tạo mới (ở đây tạm thời sync)
    if (!current) {
      // TODO: Optimize by creating conversation directly from message info if possible
      await this.syncByAccount({ address: message.accountId } as Account)
      return
    }

    await this.repository.upsert({
      ...current,
      unreadCount: message.sender === message.accountId ? 0 : (current.unreadCount ?? 0) + 1,
      lastMessage: message,
      updatedAt: new Date(message.timestamp)
    })
  }

  /**
   * @deprecated Use updateWithLastMessage instead
   */
  async updateConversation(account: Account, conversationId: string, encryptedContent: string) {
    // 1. Lấy conversation hiện tại
    const current = await this.repository.getById(account.address, conversationId)

    if (!current) {
      // Chưa có hàm lấy thông tin của user bằng contract address nên tạm thời fetch lại toàn bộ danh sách nhắn tin
      await this.syncByAccount(account)
      return
    }
    const decryptedPayload = await this.walletService.decryptMessage<OnChainMessagePayload>(
      current.publicKey,
      account.address,
      encryptedContent
    )

    await this.repository.upsert({
      ...current,
      unreadCount: account.contractAddress === conversationId ? 0 : (current.unreadCount ?? 0) + 1,
      lastMessage: mapperToMessage({
        accountId: account.address,
        conversationId: current.conversationId,
        timestamp: new Date(Number(Math.floor(Date.now() / 1000)) * 1000),
        ...decryptedPayload
      }),
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
      updatedAt: new Date(Number(Math.floor(Date.now() / 1000)) * 1000)
    })
  }

  // ------------------------------------------------------------------
  // GROUP (create / add membesr)
  // ------------------------------------------------------------------

  async createGroup() {}
}
