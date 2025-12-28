import type { GetFullInboxOutput, UserProfileOutput } from './types'

export interface UserConversationContract {
  userProfile(payload: { from: string; to: string }): Promise<UserProfileOutput>
  getFullInbox(payload: { from: string; to: string }): Promise<GetFullInboxOutput[]>
}
