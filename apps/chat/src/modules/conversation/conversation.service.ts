import type { Account } from '@/modules/account'
import type {
  EkycContract,
  FactoryContract,
  GroupContract,
  UserContract,
  VerifyContract
} from '@/modules/blockchain'
import type { FileCacheService } from '@/modules/file-cache'
import { mapperToMessage, type Message, type OnChainMessagePayload } from '@/modules/message'
import type { WalletService } from '@/modules/wallet'
import { generateSecureId } from '@/shared/lib/ids'
import { fulfilledPromises } from '@/shared/utils'
import {
  decryptAESGCM,
  encryptAESGCM,
  getPrivateKeyFromDb,
  sendCommand
} from '@metanodejs/system-core'
import type { AnonymousGroupContract } from '../blockchain/anonymous-group-contract'
import type { EventLogContainer, EventMap } from '../eventlogs'
import { mapperToConversation } from './conversation.mapper'
import type { ConversationRepository } from './conversation.repository'
import {
  HistoryVisibility,
  type Conversation,
  type ConversationType,
  type PayloadAddMembers,
  type PayloadCreateGroup
} from './conversation.type'

export class ConversationService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly userContract: UserContract,
    private readonly factoryContract: FactoryContract,
    private readonly groupContract: GroupContract,
    private readonly walletService: WalletService,
    private readonly fileCacheService: FileCacheService,
    private readonly eventLogContainer: EventLogContainer,
    private readonly anonymousGroupContract: AnonymousGroupContract,
    private readonly verifyContract: VerifyContract,
    private readonly ekycContract: EkycContract
  ) {}
  // ------------------------------------------------------------------
  // Private helpers

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

  private async getGroupInfo(account: Account, conversationId: string) {
    const { address: accountId, hiddenAddress } = account

    const [publicKey, name] = await fulfilledPromises([
      this.groupContract.userToPublicKeyAdmin({
        from: hiddenAddress,
        to: conversationId,
        inputData: {
          '': account.address
        }
      }),

      this.groupContract.groupName({
        from: hiddenAddress,
        to: conversationId
      })
    ])

    const admin = await this.groupContract.admin({
      from: hiddenAddress,
      to: conversationId
    })

    const encryptedKey = await this.groupContract.getMyEncryptedGroupKey({
      from: hiddenAddress,
      to: conversationId,
      inputData: {}
    })

    const sharedKeyWithAdmin = await this.handleCreateECDHPassword(accountId, publicKey)

    let groupKey = ''
    groupKey = (await decryptAESGCM(sharedKeyWithAdmin, encryptedKey))?.result

    return {
      admin,
      groupKey,
      name
    }
  }

  private async getAnonymousGroupInfo(accountId: string, conversationId: string) {
    const admin = await this.anonymousGroupContract.initialAdmin({
      from: accountId,
      to: conversationId
    })

    const userContract = await this.factoryContract.getUserContract({
      from: accountId,
      inputData: {
        user: admin
      }
    })

    const encryptedKey = await this.anonymousGroupContract.getMyEncryptedGroupKey({
      from: accountId,
      to: conversationId,
      inputData: {}
    })

    const rs = await Promise.all([
      this.userContract.publicKey({
        from: accountId,
        to: userContract
      }),

      this.anonymousGroupContract.groupName({
        from: accountId,
        to: conversationId
      })
    ]).catch(() => {
      return []
    })

    const [publicKey, name] = rs
    const sharedKeyWithAdmin = await this.handleCreateECDHPassword(accountId, publicKey)

    const groupKey = (await decryptAESGCM(sharedKeyWithAdmin, encryptedKey))?.result

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
    try {
      console.log('syncByAccount asdfasdf 1')
      const inboxs = await this.userContract.getFullInbox({
        from: account.hiddenAddress,
        to: account.contractAddress
      })
      console.log('syncByAccount asdfasdf 2', inboxs)

      const conversations = await fulfilledPromises(
        inboxs.map(async (item) => {
          let name = 'savedMessages'
          let groupInfo: any
          let conversationKey = ''
          let isVerifed: boolean | undefined
          let userProfile = { firstName: '', lastName: '', userName: '', avatar: '' }
          let lastMessageDecrypted: OnChainMessagePayload | undefined
          const isGroup =
            item.conversationType === 'group' || item.conversationType === 'anonymous_group'

          console.log('[KHAIHOAN DEBUG CONVERSATION]----1402GROUP--- item', item.conversationType)
          if (isGroup) {
            if (item.conversationType === 'group') {
              groupInfo = await this.getGroupInfo(account, item.conversationId)
            } else {
              groupInfo = await this.getAnonymousGroupInfo(account.address, item.conversationId)
            }

            console.log('[KHAIHOAN DEBUG CONVERSATION]----1402GROUP--- groupInfo', groupInfo)
            name = item.name
            conversationKey = groupInfo.groupKey
            lastMessageDecrypted = await this.decryptGroupMessage(
              item.latestMessageContent,
              groupInfo.groupKey
            ).catch(() => {
              return undefined
            })
          } else {
            if (item.conversationId !== account.contractAddress) {
              name = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ')
            }

            const targetAddress = await this.userContract.owner({
              from: account.address,
              to: item.conversationId
            })
            const [p2pInfo, auth, ekyc] = await Promise.all([
              this.getP2PInfo(account.address, item.conversationId),
              this.verifyContract.authenticatedWallets({
                from: account.address,
                inputData: {
                  '': targetAddress
                }
              }),
              this.ekycContract.getUser({
                from: account.address,
                inputData: {
                  user: targetAddress
                }
              })
            ])

            isVerifed === auth && ekyc.kycVerified
            conversationKey = p2pInfo.publicKey
            userProfile = p2pInfo.userProfile

            const decryptedPublicKey =
              account.contractAddress === item.sender ? account.publicKey : p2pInfo.publicKey
            lastMessageDecrypted = (await this.walletService
              .decryptMessage(decryptedPublicKey, account.address, item.latestMessageContent)
              .catch(() => {
                return undefined
              })) as any
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
          const rs = mapperToConversation({
            ...item,
            accountId: account.address,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            userName: userProfile.userName,
            name,
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
                  account,
                  conversationId: item.conversationId,
                  timestamp: item.latestMessageTimestamp,
                  ...lastMessageDecrypted
                }),
            admin: groupInfo?.admin,
            isVerifed
          })
          return rs
        })
      )

      console.log('[KHAIHOAN DEBUG CONVERSATION]----1402GROUP--- conversations', conversations)
      const finalConversations = conversations.filter(Boolean) as Conversation[]

      await this.repository.bulkUpsert(finalConversations)
    } catch (error) {
      console.error('full ib error', error)
      throw error
    }
  }

  // ------------------------------------------------------------------
  // READ
  // ------------------------------------------------------------------
  async getConversationById(
    account: Account | undefined = undefined,
    conversationId: string,
    conversationType: ConversationType,
    useDb = true
  ): Promise<Conversation | undefined> {
    if (!account) return

    const { address: accountId, hiddenAddress } = account
    if (useDb) {
      const conversationLocal = await this.repository.getById(accountId, conversationId)
      if (conversationLocal) return conversationLocal
    }

    let conversation

    switch (conversationType) {
      case 'private':
      case 'p2p': {
        const userProfile = await this.userContract.userProfile({
          from: hiddenAddress,
          to: conversationId
        })
        const publicKey = await this.userContract.publicKey({
          from: hiddenAddress,
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
        const groupInfo = await this.getGroupInfo(account, conversationId)

        conversation = mapperToConversation({
          conversationId,
          accountId,
          conversationKey: groupInfo.groupKey,
          conversationType: 'group',
          name: groupInfo.name
        })

        break
      }
      case 'anonymous_group': {
        const groupInfo = await this.getAnonymousGroupInfo(accountId, conversationId)
        conversation = mapperToConversation({
          conversationId,
          accountId,
          conversationKey: groupInfo.groupKey,
          conversationType: 'anonymous_group',
          name: groupInfo.name
        })
        break
      }
    }

    if (!conversation) throw new Error('[getConversationById]: Invalid conversation')

    if (useDb) {
      await this.repository.upsert(conversation)
    }
    return conversation
  }

  async getConversationList(account?: Account): Promise<Conversation[]> {
    if (!account) return []
    const data = await this.repository.getSortedByAccount(account.address)

    console.log('[KHAIHOAN DEBUG CONVERSATION]----1402GROUP-getConversationList--- data', data)

    return data
  }

  async getGroupMembers(
    accountId: string,
    conversationId: string,
    conversationType: ConversationType = 'group'
  ): Promise<string[]> {
    let members: string[] = []
    if (conversationType === 'group') {
      members = await this.groupContract.getMemberListGroup({
        from: accountId,
        to: conversationId
      })
    } else if (conversationType === 'anonymous_group') {
      members = await this.anonymousGroupContract.getAllMembers({
        from: accountId,
        to: conversationId
      })
    }

    return await fulfilledPromises(
      members.map(
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
  // ---------------------------------------------------------o---------
  async clearAccountData(accountId: string): Promise<void> {
    await this.repository.clearByAccount(accountId)
  }

  /** Xóa một conversation khỏi IndexedDB (theo cặp accountId + conversationId). */
  async deleteConversation(accountId: string, conversationId: string): Promise<void> {
    await this.repository.delete(accountId, conversationId)
  }

  async updateWithLastMessage(message: Message) {
    if (!message.accountId) return
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
        account,
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

  async handleCreateECDHPassword(address: string, publicKey: string) {
    let pass: any
    if (window.fiaiSDK) {
      pass = await sendCommand('createECDHPassword', {
        address: address,
        publicKey: publicKey
      })
    } else {
      const privateKey = await getPrivateKeyFromDb(address)
      pass = await sendCommand('createECDHPassword', {
        privateKey,
        publicKey: publicKey
      })
    }
    return pass.password
  }

  async createGroup(
    account: Account,
    payload: PayloadCreateGroup
  ): Promise<EventMap['GroupCreatedByUser'] & { groupKey: string }> {
    const { name, avatar = '', policy = HistoryVisibility.VISIBLE } = payload
    const groupKey = generateSecureId()
    console.log('[createGroup] 1')
    const sharedSecrect = await this.handleCreateECDHPassword(account.address, account.publicKey)
    console.log('[createGroup] 2', { sharedSecrect })

    const { result: encryptedInitialGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)
    console.log('[createGroup] 3', { encryptedInitialGroupKey })

    const promise = new Promise<any>((resolve) => {
      const off = this.eventLogContainer.eventLog.on('GroupCreatedByUser', (event) => {
        console.log('[GroupCreated] e', event)
        off()
        resolve({
          groupKey,
          ...event
        })
      })
    })
    await this.factoryContract.createGroup({
      from: account.hiddenAddress,
      inputData: {
        groupName: name,
        groupAvatar: avatar,
        encryptedInitialGroupKey,
        initialPolicy: policy,
        _description: '',
        _publicKeyAdmin: account.publicKey
      }
    })
    const rs = await promise

    return rs
  }

  async addMembers(
    account: Account,
    groupConversation: string,
    groupKey: string,
    members: PayloadAddMembers[]
  ) {
    const users: string[] = []
    const encryptedKeys: string[] = []

    for (const member of members) {
      const { publicKey, conversationId } = member
      const addressMember = await this.userContract.owner({
        from: account.address,
        to: conversationId
      })

      const sharedSecrect = await this.handleCreateECDHPassword(account.address, publicKey)

      const { result: encryptedGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)
      users.push(addressMember)
      encryptedKeys.push(encryptedGroupKey)
    }

    await this.groupContract.addAllMember({
      to: groupConversation,
      from: account.hiddenAddress,
      inputData: {
        users,
        encryptedKeys
      }
    })
  }

  // ------------------------------------------------------------------
  // ANONYMOUS GROUP (create / add membesr)
  // ------------------------------------------------------------------

  async createAnonymousCommunity(
    account: Account,
    payload: PayloadCreateGroup
  ): Promise<EventMap['AnonymousCommunityCreated'] & { groupKey: string }> {
    const { name = '', avatar = '', policy = HistoryVisibility.VISIBLE, oldGroup } = payload

    let groupKey = oldGroup?.groupKey || ''

    if (!groupKey) {
      groupKey = generateSecureId()
    }

    const sharedSecrect = await this.handleCreateECDHPassword(account.address, account.publicKey)

    const { result: encryptedInitialGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)

    const promise = new Promise<any>((resolve) => {
      const off = this.eventLogContainer.eventLog.on('AnonymousCommunityCreated', (event) => {
        off()
        resolve({
          groupKey,
          ...event
        })
      })
    })

    await this.factoryContract.createAnonymousCommunity({
      from: account.address,
      inputData: {
        _globalDefaultAvatar: '',
        avatarNormal: oldGroup?.avatar || '',
        encryptedInitialGroupKey: encryptedInitialGroupKey,
        groupName: name,
        groupAvatar: avatar,
        initialPolicy: policy,
        _publicKeyAdmin: account.publicKey
      }
    })

    const rs = await promise

    return rs
  }

  async addMembersInAnonymousGroup(
    account: Account,
    groupConversation: string,
    groupKey: string,
    members: PayloadAddMembers[]
  ) {
    const newMembers: string[] = []
    const encryptedKeys: string[] = []

    for (const member of members) {
      const { publicKey, conversationId } = member

      const addressMember = await this.userContract.owner({
        from: account.hiddenAddress,
        to: conversationId
      })

      const sharedSecrect = await this.handleCreateECDHPassword(account.address, publicKey)

      const { result: encryptedGroupKey } = await encryptAESGCM(sharedSecrect, groupKey)
      newMembers.push(addressMember)
      encryptedKeys.push(encryptedGroupKey)
    }

    await this.anonymousGroupContract.addManyMember({
      to: groupConversation,
      from: account.hiddenAddress,
      inputData: {
        addedBy: account.address,
        newMembers,
        teamId: '0',
        avatarUser: '',
        encryptedKeys
      }
    })
  }

  // ------------------------------------------------------------------
  // WRITE
  // ------------------------------------------------------------------

  async setConversationById(
    account: Account | undefined = undefined,
    conversationId: string,
    value: Partial<Conversation>
  ): Promise<Conversation | undefined> {
    if (!account) return

    const { address: accountId } = account
    const conversationLocal = await this.repository.getById(accountId, conversationId)
    if (!conversationLocal) return

    const updatedConversation: Conversation = {
      ...conversationLocal,
      ...value
    }

    await this.repository.upsert(updatedConversation)
    return updatedConversation
  }

  async getConversationKey({ id, type }: BaseConversation, account: Account) {
    switch (type) {
      case 'p2p': {
        return this.userContract.publicKey({
          from: account.hiddenAddress,
          to: id
        })
      }
      case 'anonymous_group':
      case 'group': {
        const base = { from: account.hiddenAddress, to: id }
        const adminPublicKey = await this.groupContract.userToPublicKeyAdmin({
          ...base,
          inputData: { '': account.address }
        })
        const encryptedKey = await this.groupContract.getMyEncryptedGroupKey({
          ...base
        })
        const sharedKeyWithAdmin = await this.handleCreateECDHPassword(
          account.address,
          adminPublicKey
        )
        return (await decryptAESGCM(sharedKeyWithAdmin, encryptedKey))?.result
      }

      default:
        throw new Error(`[getConversationKey] Invalid type: ${type}`)
    }
  }
}
