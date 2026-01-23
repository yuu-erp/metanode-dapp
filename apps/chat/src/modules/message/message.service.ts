import type { Account } from '@/modules/account'
import type { UserContract } from '@/modules/blockchain'
import type { Conversation } from '@/modules/conversation'
import type { EventBusPort } from '@/modules/event'
import type { EventMap } from '@/modules/eventlogs'
import type { WalletService } from '@/modules/wallet'
import { fulfilledPromises } from '@/shared/utils'
import type { AppEvents } from '@/types/app-events'
import { v4 as uuidv4 } from 'uuid'
import type { Message, SendPayload } from '.'
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
    const { limit = 50, page = 1 } = options ?? {} // page mặc định = 1 (không phải 2)
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
      rawMessages.map(async (item) => {
        try {
          const isIncoming = item.sender === conversation.conversationId

          const decryptWithPublicKey = isIncoming
            ? conversation.publicKey // 🔑 public key của người gửi
            : account.publicKey // 🔑 public key của chính mình

          const messageDecrypt = await this.walletService.decryptMessage<any>(
            decryptWithPublicKey,
            account.address,
            item.finalContent
          )
          console.log(
            '[MESSAGE SERVICE] ---- getProcessedP2PMessages --- messageDecrypt',
            messageDecrypt
          )

          return mapperToMessage({
            accountId: account.address,
            conversationId: conversation.conversationId,
            ...item,
            ...messageDecrypt
          })
        } catch (error) {
          console.error(error)
        }
      })
    )
    // Trường hợp conversation là Saved Messages ( cần bổ sung thêm replace Ox và chuyển toàn bộ ký tự về chữ thường)
    if (account.contractAddress === conversation.conversationId) {
      return Array.from(
        new Map((messages.filter(Boolean) as Message[]).map((item) => [item.id, item])).values()
      )
    }
    return messages.filter(Boolean) as Message[]
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

  async messageReceived(account: Account, data: EventMap['MessageReceived']): Promise<Message> {
    const { encryptedContent, sender, messageId, recipient } = data
    const publicKey = await this.userContract.publicKey({
      from: account.address,
      to: sender
    })
    const decryptMessage = await this.walletService.decryptMessage<any>(
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
}
