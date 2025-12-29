import type { TransactionPayload } from '../type'
import type { GetFullInboxOutput, GetProcessedP2PMessagesInput, UserProfileOutput } from './types'
import type { UserConversationContract } from './user-conversation.contract'

export class UserConversationService {
  constructor(private readonly userConversationContract: UserConversationContract) {}

  async userProfile(walletAddress: string, contractAddress: string): Promise<UserProfileOutput> {
    return await this.userConversationContract.userProfile({
      from: walletAddress,
      to: contractAddress
    })
  }
  async getFullInbox(
    walletAddress: string,
    contractAddress: string
  ): Promise<GetFullInboxOutput[]> {
    return await this.userConversationContract.getFullInbox({
      from: walletAddress,
      to: contractAddress
    })
  }

  async publicKey(walletAddress: string, contractAddress: string): Promise<string> {
    return await this.userConversationContract.publicKey({
      from: walletAddress,
      to: contractAddress
    })
  }

  async getProcessedP2PMessages(payload: TransactionPayload<GetProcessedP2PMessagesInput>) {
    return await this.userConversationContract.getProcessedP2PMessages(payload)
  }
}
