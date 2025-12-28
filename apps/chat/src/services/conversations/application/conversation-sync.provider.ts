import type { Conversation } from '../domain'

export interface ConversationSyncProvider {
  fetch(): Promise<Conversation[]>
}
