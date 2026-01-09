import type { Account } from '@/modules/account'
import type { MessageRepository } from './message.repository'
import type { UserContract } from '../blockchain'
import type { WalletService } from '../wallet'
import type { Message } from '.'
import type { Conversation } from '../conversation'
import { mapperToMessage } from './message.mapper'

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
}
