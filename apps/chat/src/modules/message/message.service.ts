import type { Account } from '@/modules/account'
import type {
  FactoryContract,
  FileContract,
  GroupContract,
  UserContract
} from '@/modules/blockchain'
import type { Conversation, ConversationType } from '@/modules/conversation'
import type { EventBusPort } from '@/modules/event'
import type { WalletService } from '@/modules/wallet'
import { formatAddress, fulfilledPromises } from '@/shared/utils'
import type { AppEvents } from '@/types/app-events'
import { decryptAESGCM, encryptAESGCM, share } from '@metanodejs/system-core'
import { v4 as uuidv4 } from 'uuid'
import type { FileCacheService } from '../file-cache'
// MESSAGE MODULES
import { container } from '@/container'
import { compareAddress } from '@/shared/lib'
import type { FileItem } from '@/stores/file.store'
import { messageActions } from '@/stores/message.store'
import { getPrivateKeyFromDb, sendCommand } from '@metanodejs/system-core'
import type {
  EditTextPayload,
  Message,
  OnChainMessagePayload,
  OnChainReplyReference,
  PersistedMessage,
  ReplyReference,
  SendPayload
} from '.'
import type { AnonymousGroupContract } from '../blockchain/anonymous-group-contract'
import type { EventLogContainer } from '../eventlogs'
import { asyncPriorityQueue } from '../realtime'
import { createOptimisticMessage } from './message.entity'
import { MessageExtend } from './message.extend'
import { mapperMessageToOnChain, mapperToMessage } from './message.mapper'
import { encodeBase64 } from './utils'

export class MessageService {
  constructor(
    private readonly userContract: UserContract,
    private readonly groupContract: GroupContract,
    private readonly factoryContract: FactoryContract,
    private readonly fileContract: FileContract,
    private readonly walletService: WalletService,
    private readonly eventBus: EventBusPort<AppEvents>,
    private readonly fileCacheService: FileCacheService,
    private readonly anonymousGroupContract: AnonymousGroupContract,
    private readonly eventLogContainer: EventLogContainer
  ) {
    this.messageExtend = new MessageExtend(eventBus)
  }

  private messageExtend: MessageExtend

  async getProcessedP2PMessages(
    account: Account,
    conversation: Conversation,
    options?: { limit?: number; page?: number }
  ): Promise<Message[]> {
    const { limit = 50, page = 1 } = options ?? {}
    const rawMessages = await this.userContract.getProcessedP2PMessages({
      from: account.address,
      to: account.contractAddress,
      inputData: {
        partnerContractAddress: conversation.conversationId,
        limit,
        page
      }
    })
    const messages = (
      await fulfilledPromises(
        rawMessages.map((item) => this._processP2PMessage(item, account, conversation))
      )
    ).filter(Boolean)

    messages.forEach((m) =>
      messageActions.setMessage(m.id, {
        id: m.id
      })
    )

    const filteredMessages = messages.filter(Boolean) as Message[]
    // Trường hợp conversation là Saved Messages (cần de-duplicate)
    if (account.contractAddress === conversation.conversationId) {
      return Array.from(new Map(filteredMessages.map((item) => [item.id, item])).values())
    }

    return filteredMessages
  }

  private async _processP2PMessage(
    item: any,
    account: Account,
    conversation: Conversation
  ): Promise<Message | undefined> {
    try {
      const decryptionKey = conversation.conversationKey

      let decrypted = await this.walletService.decryptMessage<OnChainMessagePayload>(
        decryptionKey,
        account.address,
        item.finalContent
      )

      let replyTo: any = undefined
      if (decrypted.replyTo) {
        replyTo = await this._inflateReplyTo(decrypted.replyTo, account, conversation)
      }

      if (decrypted.type === 'file' || decrypted.type === 'voice') {
        const fileDB = await this.fileCacheService.getFile(decrypted.fileId)
        if (fileDB) {
          decrypted.filePath = URL.createObjectURL(fileDB.blob)
        }
      }

      const rs = mapperToMessage({
        accountId: account.address,
        account,
        conversationId: conversation.conversationId,
        ...item,
        ...decrypted,
        replyTo,
        isMine: account.contractAddress === item.sender
      })

      return rs
    } catch (error) {
      console.error('[MessageService] Error processing message:', error)
      return undefined
    }
  }

  private async decryptGroupMessage(key: string, content: string) {
    let decrypted = (await decryptAESGCM(key, content))?.resultUtf8

    if (typeof decrypted === 'string') {
      decrypted = JSON.parse(decrypted)
    }
    return decrypted
  }

  private async _processGroupMessage(
    item: any,
    account: Account,
    conversation: Conversation
  ): Promise<Message | undefined> {
    try {
      const decrypted = await this.decryptGroupMessage(
        conversation.conversationKey,
        item.finalContent
      )

      let replyTo: any = undefined

      if (decrypted.replyTo) {
        const rs = await this._inflateReplyTo(decrypted.replyTo, account, conversation)

        replyTo = rs
      }
      if (decrypted.type === 'file') {
        const fileDB = await this.fileCacheService.getFile(decrypted.fileId)
        if (fileDB) {
          decrypted.filePath = URL.createObjectURL(fileDB.blob)
        }
      }

      let sender = ''
      if (conversation.conversationType === 'anonymous_group') {
        sender = item.authorAlias
      } else if (conversation.conversationType === 'group' && Number(item.author) !== 0) {
        sender = item.author
      }

      let isMine: any = undefined
      if (conversation.conversationType === 'anonymous_group') {
        const memberAlias = await this.anonymousGroupContract.getAliasMember({
          from: account.address,
          to: conversation.conversationId
        })
        isMine = memberAlias === item?.authorAlias
      } else if (conversation.conversationType === 'group') {
        isMine = formatAddress(account.address) === formatAddress(item.author)
      }

      const isRead = item.readBy.length > 0

      const rs = mapperToMessage({
        address: account.address,
        conversationId: conversation.conversationId,
        sender,
        ...item,
        ...decrypted,
        replyTo,
        isMine,
        conversationType: conversation.conversationType,
        reactionSummary: item.reactions,
        isRead: isRead,
        account
      })

      return rs
    } catch (error) {
      console.error('[MessageService] Error processing message:', error)
      return undefined
    }
  }

  async _inflateReplyTo(
    replyTo: OnChainReplyReference,
    account: Account,
    conversation: Conversation
  ): Promise<ReplyReference | OnChainReplyReference> {
    try {
      const { messageId, sender } = replyTo

      let decrypted = {}

      if (conversation.conversationType === 'p2p') {
        const replyMessage = await this.userContract.getMessageById({
          from: account.address,
          to: account.contractAddress,
          inputData: { _messageId: messageId }
        })

        const decryptionKey = await this._getDecryptionKey(sender, account, conversation)

        const { replyTo, ...decryptedData }: any =
          await this.walletService.decryptMessage<OnChainMessagePayload>(
            decryptionKey,
            account.address,
            replyMessage.encryptedContent
          )

        decrypted = decryptedData
      } else if (
        conversation.conversationType === 'group' ||
        conversation.conversationType === 'anonymous_group'
      ) {
        const payload = {
          from: account.address,
          to: conversation.conversationId,
          inputData: { _messageId: messageId }
        }

        const replyMessage =
          conversation.conversationType === 'group'
            ? await this.groupContract.getMessageById(payload)
            : await this.anonymousGroupContract.getMessageById(payload)

        const { replyTo, ...decryptedData } = await this.decryptGroupMessage(
          conversation.conversationKey,
          replyMessage.finalContent
        )

        decrypted = decryptedData
      }
      return {
        messageId,
        sender,
        ...decrypted
      }
    } catch (error) {
      console.error('[MessageService] Failed to inflate replyTo:', error)
      return replyTo
    }
  }

  private async _getDecryptionKey(
    sender: string,
    account: Account,
    conversation: Conversation
  ): Promise<string> {
    if (sender === account.contractAddress) return account.publicKey
    if (sender === conversation.conversationId) return conversation.conversationKey

    return await this.userContract.publicKey({
      from: account.address,
      to: sender
    })
  }

  async sendMessage(
    account: Account,
    conversation: Conversation,
    payload: SendPayload
  ): Promise<string> {
    const clientId = uuidv4()
    const optimisticMessage = createOptimisticMessage(
      {
        clientId,
        accountId: account.address,
        conversationId: conversation.conversationId,
        sender: account.contractAddress,
        recipient: account.contractAddress,
        timestamp: Date.now(),
        ...(payload.replyTo && { replyTo: payload.replyTo }),
        ...(payload.forwardFrom && { forwardFrom: payload.forwardFrom })
      },
      payload
    )

    // optimistic update
    this.eventBus.emit('message.add', {
      conversationId: conversation.conversationId,
      message: optimisticMessage,
      isMine: true,
      conversationType: 'p2p'
    })

    // 🔗 map sang payload ON-CHAIN (type, value, replyTo)
    const messageOnChain = mapperMessageToOnChain(optimisticMessage)

    const stringifyMessage = JSON.stringify(messageOnChain)

    const rs = await this.sendStringtifiedMessage(account, conversation, stringifyMessage, clientId)

    return rs
  }

  async decryptMessageForP2p(
    account: Account,
    data: {
      encryptedContent: string
      sender: string
      messageId: string
      recipient: string
      isMine?: boolean
    }
  ) {
    const { encryptedContent, sender, messageId, recipient } = data
    const publicKey = await this.userContract.publicKey({
      from: account.address,
      to: sender
    })
    const decryptMessage = await this.walletService.decryptMessage<OnChainMessagePayload>(
      publicKey,
      account.address,
      encryptedContent
    )

    let replyTo: any = undefined
    if (decryptMessage.replyTo) {
      // Mock conversation for _inflateReplyTo since we don't have the full object here
      // We only need conversationId and publicKey (which we just fetched)
      // However, _inflateReplyTo uses conversation.conversationId to check if it matches reply sender
      const mockConversation = {
        conversationId: sender,
        conversationKey: publicKey, // Use the fetched public key of the sender
        conversationType: 'p2p'
      } as Conversation

      replyTo = await this._inflateReplyTo(decryptMessage.replyTo, account, mockConversation)
    }
    if (decryptMessage.type === 'file') {
      const fileDB = await this.fileCacheService.getFile(decryptMessage.fileId)
      if (fileDB) {
        decryptMessage.filePath = URL.createObjectURL(fileDB.blob)
      }
    }
    return mapperToMessage({
      ...decryptMessage,
      messageId,
      accountId: account.address,
      conversationId: data.isMine ? recipient : sender,
      sender,
      recipient,
      replyTo,
      isMine: data.isMine
    })
  }

  async reactToMessage(
    account: Account,
    conversation: Conversation,
    payload: {
      emoji: string
      messageId: string
    }
  ): Promise<void> {
    const { emoji, messageId } = payload

    // 🔥 optimistic UI

    const encryptEmoji = encodeBase64(emoji)

    this.eventBus.emit('reaction.upsert', {
      messageId,
      conversationId: conversation.conversationId,
      reactor: account.contractAddress,
      accountId: account.address,
      emoji: encryptEmoji,
      isMine: true
    })

    await this.userContract.reactToMessage({
      from: account.address,
      to: account.contractAddress,
      inputData: {
        partnerContract: conversation.conversationId,
        _messageId: messageId,
        _reaction: encryptEmoji,
        _reactionToPartner: encryptEmoji
      }
    })
  }

  async editMessage(
    account: Account,
    conversation: Conversation,
    messageOld: PersistedMessage,
    payload: EditTextPayload
  ): Promise<void> {
    // 🚫 chỉ cho phép edit text
    if (messageOld.type !== 'text') {
      throw new Error('Only text messages can be edited')
    }

    // ✏️ optimistic message (giữ nguyên id)
    const optimisticMessage: PersistedMessage = {
      ...messageOld,
      content: payload.content,
      isEdited: true,
      status: 'sending',
      timestamp: Date.now(),
      ...(payload.replyTo && { replyTo: payload.replyTo }),
      ...(payload.forwardFrom && { forwardFrom: payload.forwardFrom })
    }

    // 🔥 Optimistic UI update
    this.eventBus.emit('message.update', {
      accountId: account.address,
      conversationId: conversation.conversationId,
      messageId: messageOld.id,
      message: optimisticMessage
    })

    // 🔗 map sang payload on-chain
    const messageOnChain = mapperMessageToOnChain(optimisticMessage)
    const stringifyMessage = JSON.stringify(messageOnChain)

    const [encryptedForRecipient, encryptedForSelf] = await Promise.all([
      this.walletService.encryptMessage(
        conversation.conversationKey,
        account.address,
        stringifyMessage
      ),
      this.walletService.encryptMessage(account.publicKey, account.address, stringifyMessage)
    ])

    try {
      // 📡 gọi smart contract edit
      await this.userContract.editMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: {
          partnerContract: conversation.conversationId,
          _messageId: messageOld.id,
          newEncryptedContent: encryptedForSelf,
          newEncryptedContentForPartner: encryptedForRecipient
        }
      })

      // ✅ update status sent
      this.eventBus.emit('message.status', {
        accountId: account.address,
        conversationId: conversation.conversationId,
        clientId: messageOld.id,
        messageId: messageOld.id,
        status: messageOld.status
      })
    } catch (error) {
      // ❌ rollback / failed
      this.eventBus.emit('message.status', {
        accountId: account.address,
        conversationId: conversation.conversationId,
        clientId: messageOld.id,
        messageId: messageOld.id,
        status: 'failed'
      })
      throw error
    }
  }

  async deleteMessage(
    account: Account,
    conversation: Conversation,
    message: PersistedMessage
  ): Promise<void> {
    this.eventBus.emit('message.delete', {
      messageId: message.id,
      conversationId: conversation.conversationId
    })
    await this.userContract.deleteMessageV2({
      from: account.hiddenAddress,
      to: account.contractAddress,
      inputData: {
        _messageId: message.id,
        partnerContract: conversation.conversationId
      }
    })
  }

  async sendFile(
    account: Account,
    conversation: Conversation,
    files: FileItem[],
    type = 'file',
    content: string
  ): Promise<void> {
    console.log({ account, conversation, files, type, content })
  }

  // Remove _computeChunkHash as it is in the worker now

  async downloadFile(
    account: Account,
    fileKey: string,
    fileName: string,
    mimeType: string,
    onProgress?: (percent: number) => void,
    chunkLimit = 50,
    concurrency = 4
  ): Promise<string> {
    try {
      // 0. Check cache
      const cachedFile = await this.fileCacheService.getFile(fileKey)

      if (cachedFile) {
        let path = cachedFile.filePath

        if (!path) {
          await this.fileCacheService.saveFile(
            fileKey,
            cachedFile.blob,
            cachedFile.mimeType,
            fileName,
            path
          )

          this.eventBus.emit('file.cached', {
            fileKey,
            filePath: URL.createObjectURL(cachedFile.blob)
          })
        }

        if (!window?.fiaiSDK) {
          await share({ type: 'file', path, title: fileName })
        }

        return ''
      }

      // 1. Get file info

      //@ts-ignore
      const { infos } = await this.fileContract.getFilesInfo({
        from: account.address,
        inputData: { fileKeys: [fileKey] }
      })

      if (!infos) throw new Error('File not found on chain')

      const totalChunksNum = Number(infos[0].totalChunks)

      // 2. Prepare
      const chunks: Uint8Array[] = new Array(totalChunksNum)
      let downloadedChunks = 0

      // 3. Create tasks (batch by chunkLimit)
      const tasks: Array<() => Promise<void>> = []

      for (let i = 0; i < totalChunksNum; i += chunkLimit) {
        tasks.push(async () => {
          const currentLimit = Math.min(chunkLimit, totalChunksNum - i)

          const result: any = await this.fileContract.downloadFile({
            from: account.address,
            inputData: {
              fileKey,
              start: i,
              limit: currentLimit
            }
          })

          const hexArray = Array.isArray(result) ? result : [result]

          hexArray.forEach((hexString: string, idx: number) => {
            const rawHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString

            const bytes = new Uint8Array(
              (rawHex.match(/[\da-f]{2}/gi) || []).map((h: string) => parseInt(h, 16))
            )

            chunks[i + idx] = bytes
          })

          downloadedChunks += currentLimit

          if (onProgress) {
            const percent = Math.floor((downloadedChunks / totalChunksNum) * 100)
            onProgress(percent)
          }
        })
      }

      // 4. Run with concurrency control
      const executing = new Set<Promise<void>>()

      for (const task of tasks) {
        //@ts-ignore
        const p = task().then(() => executing.delete(p))
        executing.add(p)

        if (executing.size >= concurrency) {
          await Promise.race(executing)
        }
      }

      await Promise.all(executing)

      // 5. Combine chunks
      const totalSize = chunks.reduce((acc, c) => acc + c.length, 0)
      const combinedBuffer = new Uint8Array(totalSize)

      let offset = 0
      for (const chunk of chunks) {
        combinedBuffer.set(chunk, offset)
        offset += chunk.length
      }

      const blob = new Blob([combinedBuffer], { type: mimeType })

      let path = ''

      // 6. Cache full file
      try {
        await this.fileCacheService.saveFile(fileKey, blob, mimeType, fileName, path)
        const filePath = URL.createObjectURL(blob)

        this.eventBus.emit('file.cached', {
          fileKey,
          filePath
        })
      } catch (err) {
        console.error('[cache failed]', err)
      }

      // 7. Share
      if (!window.fiaiSDK) {
        await share({ type: 'file', path, title: fileName })
      }
      return path
    } catch (error) {
      console.error('[Download failed]', error)
      throw error
    }
  }

  // SEND GROUP MESSAGE
  async getGroupMessages(
    account: Account,
    conversation: Conversation,
    options?: { limit?: number; page?: number }
  ): Promise<Message[]> {
    const { limit = 50, page = 1 } = options ?? {}
    let rawMessages: any[] = []
    if (conversation.conversationType === 'group') {
      rawMessages = await this.groupContract.getProcessedGroupMessages({
        from: account.address,
        to: conversation.conversationId,
        inputData: {
          limit,
          page
        }
      })
    } else if (conversation.conversationType === 'anonymous_group') {
      try {
        rawMessages = await this.anonymousGroupContract.getProcessedGroupMessagesWithReactions({
          from: account.address,
          to: conversation.conversationId,
          inputData: {
            limit,
            page,
            sender: `0x${account.address}`
          }
        })
      } catch (error) {
        rawMessages = []
      }
    }

    console.log('rawMessages group', rawMessages)

    const messages = (
      await fulfilledPromises(
        rawMessages.map((item) => this._processGroupMessage(item, account, conversation))
      )
    ).filter(Boolean)

    const filteredMessages = messages.filter(Boolean) as Message[]
    // Trường hợp conversation là Saved Messages (cần de-duplicate)
    if (account.contractAddress === conversation.conversationId) {
      return Array.from(new Map(filteredMessages.map((item) => [item.id, item])).values())
    }

    return filteredMessages
  }

  async getRecipientOwners(account: Account, conversation: Conversation) {
    const members = await this.groupContract.getMemberListGroup({
      from: account.address,
      to: conversation.conversationId
    })

    const contractAddresses = await Promise.all(
      members.map(async (mem) => {
        const contractAddress = await this.factoryContract.getUserContract({
          from: account.address,
          inputData: {
            user: mem
          }
        })
        return { contractAddress, address: mem }
      })
    )

    const userSettings = await Promise.all(
      contractAddresses.map(async (c) => {
        const settings = await this.userContract.detailedSettings({
          from: account.address,
          to: c.contractAddress
        })

        return { ...c, ...settings }
      })
    )

    const enabledUsers = userSettings.filter((i) => i.p2pChatEnabled)
    const recipientOwners = enabledUsers.map((i) => i.address)
    const recipientContracts = enabledUsers.map((i) => i.contractAddress)

    // .filter((i) => i !== account.address)

    return { recipientOwners, recipientContracts }
  }

  async sendGroupMessae(
    account: Account,
    conversation: Conversation,
    payload: SendPayload
  ): Promise<string> {
    const clientId = uuidv4()
    let sender = account.contractAddress
    if (conversation.conversationType === 'anonymous_group') {
      sender = await this.anonymousGroupContract.getAliasMember({
        from: account.address,
        to: conversation.conversationId
      })
    }

    const optimisticMessage = createOptimisticMessage(
      {
        clientId,
        accountId: account.address,
        conversationId: conversation.conversationId,
        sender,
        recipient: conversation.conversationId,
        timestamp: Date.now(),
        ...(payload.replyTo && { replyTo: payload.replyTo }),
        ...(payload.forwardFrom && { forwardFrom: payload.forwardFrom }),
        isMine: true
      },
      payload
    )

    // optimistic update
    const messageAdd = {
      conversationId: conversation.conversationId,
      message: optimisticMessage,
      isMine: true,
      conversationType: conversation.conversationType
    }

    this.eventBus.emit('message.add', messageAdd)

    // 🔗 map sang payload ON-CHAIN (type, value, replyTo)
    const messageOnChain = mapperMessageToOnChain(optimisticMessage)
    const stringifyMessage = JSON.stringify(messageOnChain)

    return await this.sendStringtifiedMessage(account, conversation, stringifyMessage, clientId)
  }

  async editGroupMessage(
    account: Account,
    conversation: Conversation,
    messageOld: PersistedMessage,
    payload: EditTextPayload
  ): Promise<void> {
    // 🚫 chỉ cho phép edit text
    if (messageOld.type !== 'text') {
      throw new Error('Only text messages can be edited')
    }
    // ✏️ optimistic message (giữ nguyên id)
    const optimisticMessage: PersistedMessage = {
      ...messageOld,
      content: payload.content,
      isEdited: true,
      status: 'sending',
      timestamp: Date.now(),
      ...(payload.replyTo && { replyTo: payload.replyTo }),
      ...(payload.forwardFrom && { forwardFrom: payload.forwardFrom })
    }

    // 🔥 Optimistic UI update
    this.eventBus.emit('message.updateGroup', {
      conversationId: conversation.conversationId,
      messageId: messageOld.id,
      message: optimisticMessage
    })

    // 🔗 map sang payload on-chain
    const messageOnChain = mapperMessageToOnChain(optimisticMessage)
    const stringifyMessage = JSON.stringify(messageOnChain)

    const encryptMessage = (await encryptAESGCM(conversation.conversationKey, stringifyMessage))
      ?.result

    try {
      // 📡 gọi smart contract edit

      const payload = {
        from: account.hiddenAddress,
        to: conversation.conversationId,
        inputData: {
          messageId: messageOld.id,
          newEncryptedContent: encryptMessage
        }
      }

      if (conversation.conversationType === 'group') {
        await this.groupContract.editMessage(payload)
      } else if (conversation.conversationType === 'anonymous_group') {
        await this.anonymousGroupContract.editMessage(payload)
      }

      // ✅ update status sent
      // this.eventBus.emit('message.status', {
      //   accountId: account.address,
      //   conversationId: conversation.conversationId,
      //   clientId: messageOld.id,
      //   messageId: messageOld.id,
      //   status: 'delivered'
      // })
    } catch (error) {
      // ❌ rollback / failed
      this.eventBus.emit('message.status', {
        accountId: account.address,
        conversationId: conversation.conversationId,
        clientId: messageOld.id,
        messageId: messageOld.id,
        status: 'failed'
      })
      throw error
    }
  }

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

  async decryptMessageFromGroup(
    account: Account,
    data: {
      messageId: string
      groupAddress: string
      encryptedContent: string
      type: ConversationType
      isMine?: boolean
      sender?: string
    }
  ) {
    const { encryptedContent, messageId, groupAddress, type } = data
    //chỗ này trùng với bên conversation services
    const accountId = account.address
    const conversationId = groupAddress

    if (type !== 'group' && type !== 'anonymous_group')
      throw new Error('[decryptMessageFromGroup] Invalid type')

    let sender = data?.sender ?? ''

    const encryptedKey = await this.groupContract.getMyEncryptedGroupKey({
      from: accountId,
      to: conversationId,
      inputData: {}
    })

    const adminPublicKey =
      type === 'group'
        ? await this.groupContract.userToPublicKeyAdmin({
            from: accountId,
            to: conversationId,
            inputData: {
              '': accountId
            }
          })
        : await this.anonymousGroupContract.userToPublicKeyAdmin({
            from: accountId,
            to: conversationId,
            inputData: {
              '': accountId
            }
          })

    const sharedKeyWithAdmin = await this.handleCreateECDHPassword(accountId, adminPublicKey)

    const groupKey = (await decryptAESGCM(sharedKeyWithAdmin, encryptedKey))?.result

    const { resultUtf8 } = await decryptAESGCM(groupKey, encryptedContent)

    const decryptMessage = JSON.parse(resultUtf8)

    let replyTo: any = undefined
    if (decryptMessage.replyTo) {
      // Mock conversation for _inflateReplyTo since we don't have the full object here
      // We only need conversationId and publicKey (which we just fetched)
      // However, _inflateReplyTo uses conversation.conversationId to check if it matches reply sender
      const mockConversation = {
        conversationId: groupAddress,
        conversationKey: groupKey, // Use the fetched public key of the sender
        conversationType: data.type
      } as Conversation

      replyTo = await this._inflateReplyTo(decryptMessage.replyTo, account, mockConversation)
    }

    if (decryptMessage.type === 'file') {
      const fileDB = await this.fileCacheService.getFile(decryptMessage.fileId)
      if (fileDB) {
        decryptMessage.filePath = URL.createObjectURL(fileDB.blob)
      }
    }

    const decryptedMessage = mapperToMessage({
      ...decryptMessage,
      messageId,
      accountId: account.address,
      conversationId: groupAddress,
      recipient: groupAddress,
      replyTo,
      isMine: data.isMine,
      sender,
      account
    })

    return decryptedMessage
  }

  async deleteGroupMessage(
    account: Account,
    conversation: Conversation,
    message: PersistedMessage
  ): Promise<void> {
    this.eventBus.emit('message.delete', {
      messageId: message.id,
      conversationId: conversation.conversationId
    })
    if (conversation.conversationType === 'group') {
      await this.groupContract.deleteMessage({
        from: account.hiddenAddress,
        to: conversation.conversationId,
        inputData: {
          messageId: message.id
        }
      })
    } else {
      await this.anonymousGroupContract.deleteMessage({
        from: account.hiddenAddress,
        to: conversation.conversationId,
        inputData: {
          messageId: message.id
        }
      })
    }
  }

  async reactGroupMessage(
    account: Account,
    conversation: Conversation,
    payload: {
      emoji: string
      messageId: string
    }
  ): Promise<void> {
    const { emoji, messageId } = payload

    // 🔥 optimistic UI
    // this.eventBus.emit('reaction.upsert', {
    //   conversationId: conversation.conversationId,
    //   messageId: messageId,
    //   reactor: account.address,
    //   emoji: encodeBase64(emoji),
    //   accountId: account.address
    // })

    const encryptEmoji = encodeBase64(emoji)

    const payloadData = {
      from: account.hiddenAddress,
      to: conversation.conversationId,
      inputData: {
        messageId: messageId,
        reaction: encryptEmoji
      }
    }

    if (conversation.conversationType === 'group') {
      await this.groupContract.reactToMessage(payloadData)
    } else {
      await this.anonymousGroupContract.reactToMessage(payloadData)
    }
  }

  async unReactMessage(account: Account, conversation: Conversation, messageId: string) {
    const payload = {
      from: account.hiddenAddress,
      to: conversation.conversationId,
      inputData: { messageId }
    }

    if (conversation.conversationType === 'anonymous_group') {
      await this.anonymousGroupContract.unReactToMessage(payload)
    } else if (conversation.conversationType === 'group') {
      await this.groupContract.unReactToMessage(payload)
    } else if (conversation.conversationType === 'p2p') {
      await this.userContract.unReactToMessage({
        from: account.hiddenAddress,
        to: account.contractAddress,
        inputData: {
          messageId,
          partnerContract: conversation.conversationId
        }
      })
    } else throw new Error('[UnreactToMessage] Invalid conversation type')
  }

  sendStringtifiedMessage(
    account: Account,
    conversation: Conversation,
    stringifyMessage: string,
    clientId: string,
    fileKey?: string
  ) {
    return asyncPriorityQueue.add(async () => {
      this.messageExtend.unsubscribe()
      const { conversationType } = conversation
      let promise: any

      const updateMessageId = async () => {
        const messageId = await promise
        messageActions.setMessage(clientId, { isMine: true, id: messageId })
        this.eventBus.emit('message.updateId', {
          messageId,
          clientId,
          conversationId: conversation.conversationId,
          fileId: fileKey
        })
      }

      try {
        const eventLog = this.eventLogContainer.eventLog

        if (conversationType === 'p2p' || conversationType === 'private') {
          promise = new Promise((resolve) => {
            const off = eventLog.on('MessageSent', (data) => {
              if (!compareAddress(data.sender, account.contractAddress)) return
              off()
              resolve(formatAddress(data.messageId))
            })
          })
          updateMessageId()

          const encryptedForRecipient = await this.walletService.encryptMessage(
            conversation.conversationKey,
            account.address,
            stringifyMessage
          )

          await this.userContract.sendMessage({
            from: account.hiddenAddress,
            to: account.contractAddress,
            inputData: {
              _recipientContractAddress: conversation.conversationId,
              _encryptedContentForSelf: encryptedForRecipient,
              _encryptedContentForRecipient: encryptedForRecipient
            }
          })
        } else {
          const encryptMessage = (
            await encryptAESGCM(conversation.conversationKey, stringifyMessage)
          )?.result

          if (conversationType === 'group') {
            promise = new Promise((resolve) => {
              const off = eventLog.on('MessageSentGroup', (data) => {
                if (formatAddress(data.sender) !== formatAddress(account.address)) return
                off()
                resolve(formatAddress(data.messageId))
              })
            })
            updateMessageId()

            const { recipientContracts, recipientOwners } = await this.getRecipientOwners(
              account,
              conversation
            )

            await this.groupContract.sendMessage({
              from: account.hiddenAddress,
              to: conversation.conversationId,
              inputData: {
                encryptedContent: encryptMessage,
                recipientOwners,
                recipientContracts
              }
            })
          } else if (conversationType === 'anonymous_group') {
            promise = new Promise((resolve) => {
              const off = eventLog.on('AnonymousMessageStored', async (data) => {
                const alias = await container.anonymousGroupContract.getAliasMember({
                  from: account.address,
                  to: conversation.conversationId
                })

                if (data.sender !== alias) return
                off()
                resolve(formatAddress(data.messageId))
              })
            })

            await this.anonymousGroupContract.sendMessage({
              from: account.hiddenAddress,
              to: conversation.conversationId,
              inputData: {
                encryptedContent: encryptMessage
              }
            })
            await updateMessageId()
          } else {
            throw new Error('Invalid conversation type for group message')
          }
        }

        this.messageExtend.subscribe()
        return ''
      } catch (error) {
        this.eventBus.emit('message.status', {
          accountId: account.address,
          conversationId: conversation.conversationId,
          clientId,
          status: 'failed'
        })
        throw error
      }
    }, 'high')
  }
}
