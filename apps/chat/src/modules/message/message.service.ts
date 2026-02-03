import type { Account } from '@/modules/account'
import type { UserContract } from '@/modules/blockchain'
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

export class MessageService {
  constructor(
    private readonly userContract: UserContract,
    private readonly walletService: WalletService,
    private readonly eventBus: EventBusPort<AppEvents>
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
    return mapperToMessage({
      ...decryptMessage,
      messageId,
      accountId: account.address,
      conversationId: sender,
      sender,
      recipient
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
    for (const file of files) {
      const clientId = uuidv4()
      try {
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
            type: 'file',
            fileId: '',
            fileName: file.name,
            size: file.size,
            mimeType: file.type,
            file: file,
            filePath: URL.createObjectURL(file)
          }
        )
        console.log('optimisticMessage: ', optimisticMessage)
        // optimistic update
        this.eventBus.emit('message.create', { message: optimisticMessage })
        // 🔗 map sang payload ON-CHAIN (type, value, replyTo)
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
  }
}
