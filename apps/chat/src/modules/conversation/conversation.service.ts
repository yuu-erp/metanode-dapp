import type { Account } from '@/modules/account'
import type { FactoryContract, GroupContract, UserContract } from '@/modules/blockchain'
import { mapperToMessage, type Message, type OnChainMessagePayload } from '@/modules/message'
import type { FileCacheService } from '@/modules/file-cache'
import type { WalletService } from '@/modules/wallet'
import { fulfilledPromises } from '@/shared/utils'
import { mapperToConversation } from './conversation.mapper'
import type { ConversationRepository } from './conversation.repository'
import {
  HistoryVisibility,
  type Conversation,
  type ConversationType,
  type PayloadAddMembers,
  type PayloadCreateGroup
} from './conversation.type'
import { generateSecureId } from '@/shared/lib/ids'
import {
  createECDHPassword,
  encryptAESGCM,
  getPrivateKeyFromDb,
  decryptAESGCM
} from '@metanodejs/system-core'
import type { EventLogContainer, EventMap } from '../eventlogs'

export class ConversationService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly userContract: UserContract,
    private readonly factoryContract: FactoryContract,
    private readonly groupContract: GroupContract,
    private readonly walletService: WalletService,
    private readonly fileCacheService: FileCacheService,
    private readonly eventLogContainer: EventLogContainer
  ) {}

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------
  private async decryptP2PLatestMessageContent<T = OnChainMessagePayload>(
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

  private async decryptGroupMessage(encryptedMessage: string, groupKey: string) {
    function jsonParseSafe(value: any) {
      if (typeof value === 'string' && (value.includes('{') || value.includes('[')))
        return JSON.parse(value)
      return value
    }

    const decryptData = await decryptAESGCM(groupKey, encryptedMessage)
    // @ts-ignore
    const result = jsonParseSafe(decryptData?.resultUtf8)
    return result
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
    const encryptedKey = await this.groupContract.getMyEncryptedGroupKey({
      from: accountId,
      to: conversationId,
      inputData: {}
    })

    const [publicKey, name] = await fulfilledPromises([
      this.userContract.publicKey({
        from: accountId,
        to: userContract
      }),

      this.groupContract.groupName({
        from: accountId,
        to: conversationId
      })
    ])
    const privateKey = await getPrivateKeyFromDb(accountId)
    const sharedKeyWithAdmin = (await createECDHPassword(publicKey, privateKey)).password
    // @ts-ignore
    const groupKey = (await decryptAESGCM(sharedKeyWithAdmin, encryptedKey))?.result

    console.log('thanhduy groupKey', groupKey)

    return {
      admin,
      groupKey,
      name
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
    console.log('thanhduy - inboxs', inboxs)

    const conversations = await fulfilledPromises(
      inboxs.map(async (item) => {
        let conversationKey = ''
        let userProfile = { firstName: '', lastName: '', userName: '', avatar: '' }
        let lastMessageDecrypted: OnChainMessagePayload | undefined

        if (item.conversationType === 'group') {
          const groupInfo = await this.getGroupInfo(account.address, item.conversationId)
          conversationKey = groupInfo.groupKey
          lastMessageDecrypted = await this.decryptGroupMessage(
            item.latestMessageContent,
            groupInfo.groupKey
          ).catch(() => {
            return undefined
          })

          console.log('thanhduy - end group', lastMessageDecrypted)
        } else {
          const p2pInfo = await this.getP2PInfo(account.address, item.conversationId)
          conversationKey = p2pInfo.publicKey
          userProfile = p2pInfo.userProfile

          lastMessageDecrypted = await this.decryptP2PLatestMessageContent(
            account,
            item.latestMessageContent,
            conversationKey
          ).catch(() => {
            return undefined
          })
        }

        if (lastMessageDecrypted && lastMessageDecrypted.type === 'file') {
          const fileDB = await this.fileCacheService.getFile(lastMessageDecrypted.fileId)
          if (fileDB) {
            lastMessageDecrypted.filePath = URL.createObjectURL(fileDB.blob)
          }
        }
        // Ideally, we should fetch the FULL message object if we want PersistedMessage.
        // But for list view, maybe we construct a partial one or the mapper handles it.
        // Let's assume we pass the decrypted content into the mapper via a specific field or constructed object.
        console.log('thanhduy - lastMessageDecrypted', lastMessageDecrypted)
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
          conversationKey: conversationKey,
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

    const groupAddresses = conversations
      .filter((item) => item.conversationType === 'group')
      .map((item) => item.conversationId)
    console.log('thanhduy - groupAddresses', groupAddresses)

    this.eventLogContainer.eventLog.registerEvent(account.address, groupAddresses)
    await this.repository.bulkUpsert(conversations.filter(Boolean) as Conversation[])
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async getConversationById(
    accountId: string,
    conversationId: string,
    conversationType: ConversationType
  ): Promise<Conversation | undefined> {
    const conversationLocal = await this.repository.getById(accountId, conversationId)
    if (conversationLocal) return conversationLocal
    let conversation
    switch (conversationType) {
      case 'private':
      case 'p2p': {
        const userProfile = await this.userContract.userProfile({
          from: accountId,
          to: conversationId
        })
        const publicKey = await this.userContract.publicKey({
          from: accountId,
          to: conversationId
        })
        conversation = mapperToConversation({
          conversationId,
          accountId,
          conversationKey: publicKey,
          ...userProfile,
          conversationType: 'p2p'
        })
        break
      }
      case 'group': {
        const groupInfo = await this.getGroupInfo(accountId, conversationId)
        conversation = mapperToConversation({
          conversationId,
          accountId,
          conversationKey: groupInfo.groupKey,
          conversationType: 'group'
        })
        break
      }
    }
    if (!conversation) throw new Error('[getConversationById]: Invalid conversation')
    await this.repository.upsert(conversation)
    return conversation
  }

  async getConversationList(accountId: string): Promise<Conversation[]> {
    return this.repository.getSortedByAccount(accountId)
  }

  async getGroupMembers(accountId: string, conversationId: string) {
    const membres = await this.groupContract.getMemberListGroup({
      from: accountId,
      to: conversationId
    })
    return await fulfilledPromises(
      membres.map(
        async (mem) =>
          await this.factoryContract.getUserContract({
            from: accountId,
            inputData: { user: mem }
          })
      )
    )
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
      current.conversationKey,
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
      conversationKey: account.publicKey,
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

  async createGroup(
    account: Account,
    payload: PayloadCreateGroup
  ): Promise<EventMap['GroupCreated'] & { groupKey: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, avatar = '', policy = HistoryVisibility.VISIBLE } = payload
        const groupKey = generateSecureId()
        const privateKey = await getPrivateKeyFromDb(account.address)
        const { password: sharedSecrect } = await createECDHPassword(account.publicKey, privateKey)
        const { result: encryptedInitialGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)
        console.log('thanhduy - createGroup 1')
        const off = this.eventLogContainer.eventLog.on('GroupCreated', (event) => {
          console.log('thanhduy - createGroup 4')

          off()
          resolve({
            groupKey,
            ...event
          })
        })
        console.log('thanhduy - createGroup 2')

        await this.factoryContract.createGroup({
          from: account.address,
          inputData: {
            groupName: name,
            groupAvatar: avatar,
            encryptedInitialGroupKey,
            initialPolicy: policy
          }
        })
        console.log('thanhduy - createGroup 3')
      } catch (error) {
        reject(error)
      }
    })
  }

  async addMembers(
    account: Account,
    groupConversation: string,
    groupKey: string,
    members: PayloadAddMembers[]
  ) {
    const privateKeyAdmin = await getPrivateKeyFromDb(account.address)
    for (const member of members) {
      const { publicKey, conversationId } = member
      const addressMember = await this.userContract.owner({
        from: account.address,
        to: conversationId
      })
      const { password: sharedSecrect } = await createECDHPassword(publicKey, privateKeyAdmin)
      const { result: encryptedGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)
      await this.groupContract.addMember({
        to: groupConversation,
        from: account.address,
        inputData: {
          user: addressMember,
          encryptedKeyForNewMember: encryptedGroupKey
        }
      })
    }
  }
}
