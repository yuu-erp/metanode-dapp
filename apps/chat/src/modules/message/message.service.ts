import type { Account } from '@/modules/account'
import type { FileCacheService } from '../file-cache'
import { createFileWithBuffer, share } from '@metanodejs/system-core'
import type { FileContract, UserContract } from '@/modules/blockchain'
import type { Conversation } from '@/modules/conversation'
import type { EventBusPort } from '@/modules/event'
import type { WalletService } from '@/modules/wallet'
import { fulfilledPromises } from '@/shared/utils'
import type { AppEvents } from '@/types/app-events'
import { v4 as uuidv4 } from 'uuid'
// MESSAGE MODULES
import type {
  EditTextPayload,
  Message,
  OnChainMessagePayload,
  OnChainReplyReference,
  PersistedMessage,
  ReplyReference,
  SendPayload
} from '.'
import { createOptimisticMessage } from './message.entity'
import { mapperMessageToOnChain, mapperToMessage } from './message.mapper'
import { encodeBase64 } from './utils'
import { createHashWithBuffer } from '@metanodejs/system-core'
import type { PushFileInfosParams } from '../blockchain/file-contract/types'
import { keccak256, solidityPacked } from 'ethers'

export class MessageService {
  constructor(
    private readonly userContract: UserContract,
    private readonly fileContract: FileContract,
    private readonly walletService: WalletService,
    private readonly eventBus: EventBusPort<AppEvents>,
    private readonly fileCacheService: FileCacheService
  ) {}

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
      const decryptionKey = isIncoming ? conversation.publicKey : account.publicKey

      const decrypted = await this.walletService.decryptMessage<OnChainMessagePayload>(
        decryptionKey,
        account.address,
        item.finalContent
      )

      let replyTo = undefined
      if (decrypted.replyTo) {
        replyTo = await this._inflateReplyTo(decrypted.replyTo, account, conversation)
      }

      return mapperToMessage({
        accountId: account.address,
        conversationId: conversation.conversationId,
        ...item,
        ...decrypted,
        replyTo
      })
    } catch (error) {
      console.error('[MessageService] Error processing message:', error)
      return undefined
    }
  }

  private async _inflateReplyTo(
    replyTo: OnChainReplyReference,
    account: Account,
    conversation: Conversation
  ): Promise<ReplyReference | OnChainReplyReference> {
    try {
      const { messageId, sender } = replyTo

      const replyMessage = await this.userContract.getMessageById({
        from: account.address,
        to: account.contractAddress,
        inputData: { _messageId: messageId }
      })

      const decryptionKey = await this._getDecryptionKey(sender, account, conversation)

      const decrypted = await this.walletService.decryptMessage<OnChainMessagePayload>(
        decryptionKey,
        account.address,
        replyMessage.encryptedContent
      )

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
    if (sender === conversation.conversationId) return conversation.publicKey

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
    this.eventBus.emit('message.create', { message: optimisticMessage })
    // 🔗 map sang payload ON-CHAIN (type, value, replyTo)
    const messageOnChain = mapperMessageToOnChain(optimisticMessage)
    const stringifyMessage = JSON.stringify(messageOnChain)

    const [encryptedForRecipient, encryptedForSelf] = await Promise.all([
      this.walletService.encryptMessage(conversation.publicKey, account.address, stringifyMessage),
      this.walletService.encryptMessage(account.publicKey, account.address, stringifyMessage)
    ])

    try {
      const result = await this.userContract.sendMessage({
        from: account.address,
        to: account.contractAddress,
        inputData: {
          _recipientContractAddress: conversation.conversationId,
          _encryptedContentForSelf: encryptedForSelf,
          _encryptedContentForRecipient: encryptedForRecipient
        }
      })

      this.eventBus.emit('message.sent', {
        accountId: account.address,
        conversationId: conversation.conversationId,
        clientId,
        messageId: result.messageId
      })

      return result.messageId
    } catch (error) {
      this.eventBus.emit('message.status', {
        accountId: account.address,
        conversationId: conversation.conversationId,
        clientId,
        status: 'failed'
      })
      throw error
    }
  }

  async decryptMessageFromPartner(
    account: Account,
    data: {
      encryptedContent: string
      sender: string
      messageId: string
      recipient: string
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
        publicKey: publicKey // Use the fetched public key of the sender
      } as Conversation

      replyTo = await this._inflateReplyTo(decryptMessage.replyTo, account, mockConversation)
    }

    return mapperToMessage({
      ...decryptMessage,
      messageId,
      accountId: account.address,
      conversationId: sender,
      sender,
      recipient,
      replyTo
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
    this.eventBus.emit('reaction.create', {
      accountId: account.address,
      conversationId: conversation.conversationId,
      messageId,
      emoji
    })

    const encryptEmoji = encodeBase64(emoji)

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
      this.walletService.encryptMessage(conversation.publicKey, account.address, stringifyMessage),
      this.walletService.encryptMessage(account.publicKey, account.address, stringifyMessage)
    ])

    try {
      // 📡 gọi smart contract edit
      await this.userContract.editMessage({
        from: account.address,
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
      from: account.address,
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
        this.eventBus.emit('message.create', { message: optimisticMessage })

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
      console.log('datas', datas)

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
            const base64 = encodeBase64(new Uint8Array(arrayBuffer))
            await this.fileCacheService.saveFile(
              data.fileKey,
              base64,
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

          const [encryptedForRecipient, encryptedForSelf] = await Promise.all([
            this.walletService.encryptMessage(
              conversation.publicKey,
              account.address,
              stringifyMessage
            ),
            this.walletService.encryptMessage(account.publicKey, account.address, stringifyMessage)
          ])

          const result = await this.userContract.sendMessage({
            from: account.address,
            to: account.contractAddress,
            inputData: {
              _recipientContractAddress: conversation.conversationId,
              _encryptedContentForSelf: encryptedForSelf,
              _encryptedContentForRecipient: encryptedForRecipient
            }
          })

          this.eventBus.emit('message.sent', {
            accountId: account.address,
            conversationId: conversation.conversationId,
            clientId,
            messageId: result.messageId
          })
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

  private async _splitFileIntoChunks(
    file: File
  ): Promise<{ chunkData: string[]; chunkHash: string[] }> {
    const chunkData: string[] = []
    const chunkHash: string[] = []
    const CHUNK_SIZE = 1024
    let lastChunkHash = '0x'
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const blob = file.slice(start, end)
      const buffer = new Uint8Array(await blob.arrayBuffer())

      const hash = this._computeChunkHash(lastChunkHash, buffer)
      lastChunkHash = hash

      const chunkDataContent = Array.from(buffer)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')

      chunkData.push(chunkDataContent)
      chunkHash.push(hash)
    }

    console.log(`Final file hash: ${lastChunkHash}`)
    return { chunkData, chunkHash }
  }

  private _computeChunkHash(lastChunkHash: string, chunkData: Uint8Array): string {
    const emptyBytes32 = '0x'.padEnd(66, '0')
    let encodedData: string
    if (!lastChunkHash || lastChunkHash === '0x') {
      console.log('lần 1 ===> ')
      encodedData = solidityPacked(['bytes32', 'bytes'], [emptyBytes32, chunkData])
    } else {
      console.log('lần tiếp theo ===> ')
      encodedData = solidityPacked(['bytes32', 'bytes'], [lastChunkHash, chunkData])
    }
    return keccak256(encodedData)
  }

  async downloadFile(
    account: Account,
    fileKey: string,
    fileName: string,
    mimeType: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    try {
      console.log('[downloadFile] - payload', {
        account,
        fileKey,
        fileName,
        mimeType
      })
      // 1. Get file info to know total chunks
      // @ts-ignore
      const { infos } = await this.fileContract.getFilesInfo({
        from: account.address,
        inputData: { fileKeys: [fileKey] }
      })
      console.log('fileStatus', infos)
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
        const base64 = encodeBase64(combinedBuffer)
        await this.fileCacheService.saveFile(fileKey, base64, mimeType, fileName)
        this.eventBus.emit('file.cached', { fileKey })
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
}
