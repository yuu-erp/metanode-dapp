import type { Account } from '@/modules/account'
import type { FactoryContract, GroupContract, UserContract } from '@/modules/blockchain'
import { mapperToMessage, type Message, type OnChainMessagePayload } from '@/modules/message'
import type { FileCacheService } from '@/modules/file-cache'
import type { WalletService } from '@/modules/wallet'
import { fulfilledPromises } from '@/shared/utils'
import { mapperToConversation } from './conversation.mapper'
import type { ConversationRepository } from './conversation.repository'
import { HistoryVisibility, type Conversation, type PayloadCreateGroup } from './conversation.type'
import { generateSecureId } from '@/shared/lib/ids'
import { createECDHPassword, encryptAESGCM, getPrivateKeyFromDb } from '@metanodejs/system-core'

export class ConversationService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly userContract: UserContract,
    private readonly factoryContract: FactoryContract,
    private readonly groupContract: GroupContract,
    private readonly walletService: WalletService,
    private readonly fileCacheService: FileCacheService
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

  private async getGroupInfo(accountId: string, conversationId: string) {
    const admin = await this.groupContract.admin({
      from: accountId,
      to: conversationId
    })
    const userContract = await this.factoryContract.getUserContract({
      from: accountId,
      inputData: {
        user: admin
      }
    })

    const publicKey = await this.userContract.publicKey({
      from: accountId,
      to: userContract
    })
    return {
      admin,
      publicKey
    }
  }

  // ------------------------------------------------------------------
  // SYNC from blockchain → local DB (account-scoped)
  // ------------------------------------------------------------------
  private async getP2PInfo(accountId: string, conversationId: string) {
    const [publicKey, userProfile] = await Promise.all([
      this.userContract.publicKey({
        from: accountId,
        to: conversationId
      }),
      this.userContract.userProfile({
        to: conversationId,
        from: accountId
      })
    ])
    return { publicKey, userProfile }
  }

  async syncByAccount(account: Account): Promise<void> {
    const inboxs = await this.userContract.getFullInbox({
      from: account.address,
      to: account.contractAddress
    })
    const conversations = await fulfilledPromises(
      inboxs.map(async (item) => {
        let conversationPublicKey = ''
        let userProfile = { firstName: '', lastName: '', userName: '', avatar: '' }

        if (item.conversationType === 'group') {
          const groupInfo = await this.getGroupInfo(account.address, item.conversationId)
          conversationPublicKey = groupInfo.publicKey
        } else {
          const p2pInfo = await this.getP2PInfo(account.address, item.conversationId)
          conversationPublicKey = p2pInfo.publicKey
          userProfile = p2pInfo.userProfile
        }

        const lastMessageDecrypted = await this.decryptLatestMessageContent(
          account,
          item.latestMessageContent,
          conversationPublicKey
        ).catch(() => {
          return undefined
        })

        if (lastMessageDecrypted && lastMessageDecrypted.type === 'file') {
          const fileDB = await this.fileCacheService.getFile(lastMessageDecrypted.fileId)
          if (fileDB) {
            lastMessageDecrypted.filePath = URL.createObjectURL(fileDB.blob)
          }
        }
        // Ideally, we should fetch the FULL message object if we want PersistedMessage.
        // But for list view, maybe we construct a partial one or the mapper handles it.
        // Let's assume we pass the decrypted content into the mapper via a specific field or constructed object.

        return mapperToConversation({
          ...item,
          accountId: account.address,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          userName: userProfile.userName,
          name:
            item.conversationId === account.contractAddress
              ? 'savedMessages'
              : item.conversationType === 'group'
                ? item.name
                : [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' '),
          avatar: userProfile.avatar,
          publicKey: conversationPublicKey,
          conversationType:
            item.conversationId === account.contractAddress
              ? 'private'
              : (item.conversationType as any),
          // Construct a fake object that mapperToMessage can parse
          lastMessage: !lastMessageDecrypted
            ? undefined
            : mapperToMessage({
                accountId: account.address,
                conversationId: item.conversationId,
                timestamp: item.latestMessageTimestamp,
                ...lastMessageDecrypted
              })
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

  async createGroup(account: Account, payload: PayloadCreateGroup) {
    const { name, avatar = '', policy = HistoryVisibility.VISIBLE } = payload
    const groupKey = generateSecureId()
    const privateKey = await getPrivateKeyFromDb(account.address)
    const { password: sharedSecrect } = await createECDHPassword(account.publicKey, privateKey)
    const { result: encryptedInitialGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)
    await this.factoryContract.createGroup({
      from: account.address,
      inputData: {
        groupName: name,
        groupAvatar: avatar,
        encryptedInitialGroupKey,
        initialPolicy: policy
      }
    })
  }
}
