import type { Account } from '@/modules/account'
import type { Message } from '.'
import type { UserContract } from '../blockchain'
import type { Conversation } from '../conversation'
import type { WalletService } from '../wallet'
import { createOptimisticMessage } from './message.entity'
import { mapperMessageToOnChain, mapperToMessage } from './message.mapper'
import type { MessageRepository } from './message.repository'

export class MessageService {
  constructor(
    private readonly repository: MessageRepository,
    private readonly userContract: UserContract,
    private readonly walletService: WalletService
  ) {}

  async getMessagesByConversation(accountId: string, conversationId: string) {
    return await this.repository.getMessagesByConversation(accountId, conversationId)
  }

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
    console.log('[MessageService] - getProcessedP2PMessages - rawMessages:', rawMessages)

    const messages = await Promise.all(
      rawMessages.map(async (item) => {
        const messageDescrypt = await this.walletService.decryptMessage<any>(
          conversation.publicKey,
          account.address,
          item.finalContent
        )
        return mapperToMessage({
          accountId: account.address,
          ...item,
          ...messageDescrypt
        })
      })
    )
    console.log('[MessageService] - getProcessedP2PMessages - messages:', messages)
    await this.repository.upsertMany(messages)
    return messages
  }

  async sendMessage(
    account: Account,
    conversation: Conversation,
    payload: { type: 'text'; content: string } | { type: 'sticker'; stickerId: string }
  ): Promise<string> {
    const clientId = crypto.randomUUID()

    const optimisticMessage = createOptimisticMessage(
      {
        clientId,
        accountId: account.address,
        conversationId: conversation.conversationId,
        sender: account.contractAddress,
        recipient: conversation.conversationId,
        timestamp: Date.now()
      },
      payload
    )

    await this.repository.upsert(optimisticMessage)

    try {
      const messageOnChain = mapperMessageToOnChain(optimisticMessage)
      const stringifyMessage = JSON.stringify(messageOnChain)
      const encryptedForRecipient = await this.walletService.encryptMessage(
        conversation.publicKey,
        account.address,
        stringifyMessage
      )

      const encryptedForSelf = await this.walletService.encryptMessage(
        account.publicKey,
        account.address,
        stringifyMessage
      )
      const result = await this.userContract.sendMessage({
        from: account.address,
        to: conversation.conversationId,
        inputData: {
          _recipientContractAddress: conversation.conversationId,
          _encryptedContentForSelf: encryptedForSelf,
          _encryptedContentForRecipient: encryptedForRecipient
        }
      })
      await this.repository.updateByClientId(account.address, clientId, {
        id: result.messageId, // bytes32
        status: 'sent'
      })
      return result.messageId
    } catch (error) {
      await this.repository.updateByClientId(account.address, clientId, {
        status: 'failed'
      })
      throw error
    }
  }
}
