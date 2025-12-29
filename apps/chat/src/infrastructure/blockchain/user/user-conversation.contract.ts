import type { TransactionPayload } from '../type'
import type {
  GetFullInboxOutput,
  GetProcessedP2PMessagesInput,
  GetProcessedP2PMessagesOutput,
  UserProfileOutput
} from './types'

export interface UserConversationContract {
  userProfile(payload: { from: string; to: string }): Promise<UserProfileOutput>
  getFullInbox(payload: { from: string; to: string }): Promise<GetFullInboxOutput[]>
  publicKey(payload: { from: string; to: string }): Promise<string>
  getProcessedP2PMessages(
    payload: TransactionPayload<GetProcessedP2PMessagesInput>
  ): Promise<GetProcessedP2PMessagesOutput[]>
}
