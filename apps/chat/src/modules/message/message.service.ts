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
import {
  createECDHPassword,
  createFileWithBuffer,
  decryptAESGCM,
  encryptAESGCM,
  getPrivateKeyFromDb,
  share
} from '@metanodejs/system-core'
import { v4 as uuidv4 } from 'uuid'
import type { FileCacheService } from '../file-cache'
// MESSAGE MODULES
import { createHashWithBuffer } from '@metanodejs/system-core'
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
import type { PushFileInfosParams } from '../blockchain/file-contract/types'
import { createOptimisticMessage } from './message.entity'
import { mapperMessageToOnChain, mapperToMessage } from './message.mapper'
import { encodeBase64 } from './utils'
import { asyncPriorityQueue } from '../realtime'
import type { EventLogContainer } from '../eventlogs'
import { MessageExtend } from './message.extend'

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

  private fileProcessingWorker: Worker | null = null
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
    const messages = await fulfilledPromises(
      rawMessages.map((item) => this._processP2PMessage(item, account, conversation))
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
      const isIncoming = item.sender === conversation.conversationId
      const decryptionKey = isIncoming ? conversation.conversationKey : account.publicKey

      let decrypted = await this.walletService.decryptMessage<OnChainMessagePayload>(
        decryptionKey,
        account.address,
        item.finalContent
      )
      let replyTo = undefined
      if (decrypted.replyTo) {
        replyTo = await this._inflateReplyTo(decrypted.replyTo, account, conversation)
      }
      if (decrypted.type === 'file') {
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

      let replyTo = undefined

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

      let isMine = undefined
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

    return await this.sendStringtifiedMessage(account, conversation, stringifyMessage, clientId)
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
    console.log('decryptMessage: ', decryptMessage)

    let replyTo = undefined
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
        status: 'delivered'
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

  async sendFile(account: Account, conversation: Conversation, files: File[]): Promise<void> {
    try {
      const fileInfos: PushFileInfosParams['infos'] = []
      const fileNames: string[] = []
      const preparedMessages: {
        clientId: string
        optimisticMessage: Message
      }[] = []

      for (const file of files) {
        const clientId = uuidv4()
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Array.from(new Uint8Array(arrayBuffer))
        const { hash } = await createHashWithBuffer({ buffer })
        const timestamp = Date.now()
        const sanitizedFileName = file.name
          .split('.')
          .slice(0, -1)
          .join('.')
          .replace(/\s+/g, '_')
          .replace(/[^\w\-_.]/g, '')
        const fileNameWithTimestamp = `${sanitizedFileName}_${timestamp}.${file.name.split('.').pop() || ''}`

        fileNames.push(fileNameWithTimestamp)
        fileInfos.push({
          owner: account.address,
          hash: '0x' + hash,
          contentLen: file.size,
          totalChunks: Math.ceil(file.size / 1024),
          expireTime: Math.floor(Date.now() / 1000) + 31536000, // 1 year
          name: fileNameWithTimestamp,
          ext: file.name.split('.').pop() || '',
          status: 0,
          contentDisposition: '',
          contentID: ''
        })

        const payload: SendPayload = {
          type: 'file',
          fileId: '', // Placeholder, will be updated after upload
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          filePath: '',
          file
        }

        const optimisticMessage = createOptimisticMessage(
          {
            clientId,
            accountId: account.address,
            conversationId: conversation.conversationId,
            sender: account.contractAddress,
            recipient: account.contractAddress,
            timestamp: Date.now()
          },
          {
            ...payload,
            filePath: URL.createObjectURL(file)
          }
        )

        // optimistic update
        this.eventBus.emit('message.add', {
          conversationId: conversation.conversationId,
          message: optimisticMessage,
          isMine: true,
          conversationType: conversation.conversationType
        })

        preparedMessages.push({
          clientId,
          optimisticMessage
        })
      }

      console.log('fileInfos', fileInfos)

      // 1. Push file infos to blockchain
      await this.fileContract.pushFileInfos({
        from: account.address,
        inputData: { infos: fileInfos }
      })

      const fileKeys = await this.fileContract.getFileKeyFromName({
        from: account.address,
        inputData: { names: fileNames }
      })

      const datas = files.map((file, index) => ({
        fileKey: fileKeys[index] || '',
        dataFile: file,
        preparedMessage: preparedMessages[index]
      }))

      for (const data of datas) {
        if (!data.dataFile || !data.fileKey) continue

        const { preparedMessage } = data
        const { clientId, optimisticMessage } = preparedMessage

        try {
          const { chunkData, chunkHash } = await this._splitFileIntoChunks(data.dataFile)
          // CHIA thành từng nhóm 7 CHUNK
          const chunkDataBatches = this._chunkArray(chunkData, 7)
          const chunkHashBatches = this._chunkArray(chunkHash, 7)

          for (let i = 0; i < chunkDataBatches.length; i++) {
            const batchData = chunkDataBatches[i]
            const batchHash = chunkHashBatches[i]
            await this.fileContract.uploadChunks({
              from: account.address,
              inputData: {
                fileKey: data.fileKey,
                chunkDatas: batchData,
                chunkHashes: batchHash
              }
            })
            console.log('File chunk uploaded successfully!', data.fileKey)
          }
          console.log('File upload completed successfully!', data.dataFile.name)

          // Cache the sent file
          try {
            const arrayBuffer = await data.dataFile.arrayBuffer()
            await this.fileCacheService.saveFile(
              data.fileKey,
              new Blob([arrayBuffer], { type: data.dataFile.type }),
              data.dataFile.type,
              data.dataFile.name
            )
          } catch (error) {
            console.error('[MessageService] Failed to cache sent file:', error)
          }

          // Update message with correct fileId
          if (optimisticMessage.type === 'file') {
            optimisticMessage.fileId = data.fileKey
          }

          // Prepare message payload for sending
          const messageOnChain = mapperMessageToOnChain(optimisticMessage)
          const stringifyMessage = JSON.stringify(messageOnChain)

          await this.sendStringtifiedMessage(account, conversation, stringifyMessage, clientId)
        } catch (error) {
          console.error(`[MessageService] Failed to send file/message ${clientId}`, error)
          this.eventBus.emit('message.status', {
            accountId: account.address,
            conversationId: conversation.conversationId,
            clientId,
            status: 'failed'
          })
        }
      }
    } catch (error) {
      console.error('[MessageService] sendFile error:', error)
      throw error
    }
  }

  private _chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size))
    }
    return result
  }

  private _splitFileIntoChunks(file: File): Promise<{ chunkData: string[]; chunkHash: string[] }> {
    return new Promise((resolve, reject) => {
      // Lazy init worker
      if (!this.fileProcessingWorker) {
        this.fileProcessingWorker = new Worker(
          new URL('./workers/file-processing.worker.ts', import.meta.url),
          { type: 'module' }
        )
      }

      const id = uuidv4()
      const handler = (e: MessageEvent) => {
        const { type, id: responseId, payload, error } = e.data
        if (responseId !== id) return

        if (type === 'PROCESS_COMPLETE') {
          resolve({
            chunkData: payload.chunkData,
            chunkHash: payload.chunkHash
          })
          console.log(`Final file hash: ${payload.lastChunkHash}`)
        } else if (type === 'PROCESS_ERROR') {
          reject(new Error(error))
        }

        this.fileProcessingWorker?.removeEventListener('message', handler)
      }

      this.fileProcessingWorker.addEventListener('message', handler)
      this.fileProcessingWorker.postMessage({ type: 'PROCESS_FILE', file, id })
    })
  }

  // Remove _computeChunkHash as it is in the worker now

  async downloadFile(
    account: Account,
    fileKey: string,
    fileName: string,
    mimeType: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    try {
      // 0. Check cache first
      const cachedFile = await this.fileCacheService.getFile(fileKey)
      if (cachedFile) {
        let path = cachedFile.filePath

        // If filePath is missing (legacy cache), re-create to get path
        if (!path) {
          const arrayBuffer = await cachedFile.blob.arrayBuffer()
          // Prepare name/ext logic similar to below
          const dotIndex = fileName.lastIndexOf('.')
          const name = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName
          const ext = dotIndex !== -1 ? fileName.substring(dotIndex + 1) : ''

          const result = await createFileWithBuffer(
            name,
            'message',
            ext,
            Array.from(new Uint8Array(arrayBuffer))
          )
          path = result.path

          // Update cache with new path
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

        await share({ type: 'file', path, title: fileName })
        return
      }

      // 1. Get file info to know total chunks
      // @ts-ignore
      const { infos } = await this.fileContract.getFilesInfo({
        from: account.address,
        inputData: { fileKeys: [fileKey] }
      })
      if (!infos) {
        throw new Error('File not found on chain')
      }
      // @ts-ignore
      const { totalChunks } = infos[0]
      const totalChunksNum = Number(totalChunks)

      // 2. Download chunks in batches
      const chunks: Uint8Array[] = []
      const BATCH_SIZE = 5 // Adjust concurrency as needed
      let downloadedChunks = 0

      for (let i = 0; i < totalChunksNum; i += BATCH_SIZE) {
        const batchPromises = []
        const currentBatchLimit = Math.min(BATCH_SIZE, totalChunksNum - i)

        for (let j = 0; j < currentBatchLimit; j++) {
          const chunkIndex = i + j
          batchPromises.push(
            this.fileContract
              .downloadFile({
                from: account.address,
                inputData: {
                  fileKey,
                  start: chunkIndex,
                  limit: 1 // Fetch 1 chunk at a time
                }
              })
              .then((result: any) => {
                // result is string[] because downloadFile returns bytes[]
                // Since we requested limit=1, we expect an array with 1 hex string
                const hexString = Array.isArray(result) ? result[0] : result

                // hexString is something like "0x1234..."
                const rawHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString
                // Convert hex string to Uint8Array
                const bytes = new Uint8Array(
                  (rawHex.match(/[\da-f]{2}/gi) || []).map((h: string) => parseInt(h, 16))
                )
                return { index: chunkIndex, data: bytes }
              })
          )
        }

        const batchResults = await Promise.all(batchPromises)

        // Store results in order
        batchResults.forEach((res) => {
          chunks[res.index] = res.data
        })

        downloadedChunks += currentBatchLimit
        const progress = Math.min(100, Math.floor((downloadedChunks / totalChunksNum) * 100))
        if (onProgress) onProgress(progress)
      }

      // 3. Save file using createFileWithBuffer
      const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combinedBuffer = new Uint8Array(totalSize)
      let offset = 0
      for (const chunk of chunks) {
        combinedBuffer.set(chunk, offset)
        offset += chunk.length
      }

      const dotIndex = fileName.lastIndexOf('.')
      const name = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName
      const ext = dotIndex !== -1 ? fileName.substring(dotIndex + 1) : ''
      const { path } = await createFileWithBuffer(name, 'message', ext, Array.from(combinedBuffer))
      try {
        const blob = new Blob([combinedBuffer], { type: mimeType })
        await this.fileCacheService.saveFile(fileKey, blob, mimeType, fileName, path)
        this.eventBus.emit('file.cached', {
          fileKey,
          filePath: URL.createObjectURL(blob)
        })
      } catch (error) {
        console.error('[MessageService] Failed to cache downloaded file:', error)
      }
      await share({ type: 'file', path, title: fileName })

      // Cache the downloaded file
    } catch (error) {
      console.error('[MessageService] Download file failed:', error)
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
    const messages = await fulfilledPromises(
      rawMessages.map((item) => this._processGroupMessage(item, account, conversation))
    )

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

    const recipientOwners = userSettings
      .filter((i) => i.p2pChatEnabled)
      .map((i) => i.address)
      .filter((i) => i !== account.address)

    return recipientOwners
  }

  async sendGroupMessae(
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
        recipient: conversation.conversationId,
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
      conversationType: conversation.conversationType
    })

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

    let admin = ''
    let sender = data?.sender ?? ''

    if (type === 'group') {
      admin = await this.groupContract.admin({
        from: accountId,
        to: conversationId
      })
    } else {
      admin = await this.anonymousGroupContract.initialAdmin({
        from: accountId,
        to: conversationId
      })
    }

    const adminUserContract = await this.factoryContract.getUserContract({
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

    const adminPublicKey = await this.userContract.publicKey({
      from: accountId,
      to: adminUserContract
    })
    const privateKey = await getPrivateKeyFromDb(accountId)
    const sharedKeyWithAdmin = (await createECDHPassword(adminPublicKey, privateKey)).password

    const groupKey = (await decryptAESGCM(sharedKeyWithAdmin, encryptedKey))?.result

    const { resultUtf8 } = await decryptAESGCM(groupKey, encryptedContent)
    const decryptMessage = JSON.parse(resultUtf8)

    let replyTo = undefined
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
    clientId: string
  ) {
    return asyncPriorityQueue.add(async () => {
      this.messageExtend.unsubscribe()
      const { conversationType } = conversation
      let promise: any

      const updateMessageId = async () => {
        const messageId = await promise
        this.eventBus.emit('message.updateId', {
          messageId,
          clientId,
          conversationId: conversation.conversationId
        })
      }

      try {
        const eventLog = this.eventLogContainer.eventLog

        if (conversationType === 'p2p' || conversationType === 'private') {
          promise = new Promise((resolve) => {
            const off = eventLog.on('MessageSent', (data) => {
              if (data.sender !== account.contractAddress) return
              off()
              resolve(data.messageId)
            })
          })
          updateMessageId()

          const [encryptedForRecipient, encryptedForSelf] = await Promise.all([
            this.walletService.encryptMessage(
              conversation.conversationKey,
              account.address,
              stringifyMessage
            ),
            this.walletService.encryptMessage(account.publicKey, account.address, stringifyMessage)
          ])

          await this.userContract.sendMessage({
            from: account.hiddenAddress,
            to: account.contractAddress,
            inputData: {
              _recipientContractAddress: conversation.conversationId,
              _encryptedContentForSelf: encryptedForSelf,
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
                resolve(data.messageId)
              })
            })
            updateMessageId()

            const recipientOwners = await this.getRecipientOwners(account, conversation)
            console.log('thanhduy - recipientOwners', recipientOwners)
            await this.groupContract.sendMessage({
              from: account.hiddenAddress,
              to: conversation.conversationId,
              inputData: {
                encryptedContent: encryptMessage,
                recipientOwners
              }
            })
          } else if (conversationType === 'anonymous_group') {
            promise = new Promise((resolve) => {
              const off = eventLog.on('AnonymousMessageStored', (data) => {
                if (data.sender !== account.address) return
                off()
                resolve(data.messageId)
              })
            })

            await this.anonymousGroupContract.sendMessage({
              from: account.hiddenAddress,
              to: conversation.conversationId,
              inputData: {
                encryptedContent: encryptMessage
              }
            })
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
