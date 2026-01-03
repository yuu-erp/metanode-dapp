import type { Conversation } from './conversation.type'

export interface ConversationRepository {
  // READ
  getByAccount(accountId: string): Promise<Conversation[]>
  getSortedByAccount(accountId: string): Promise<Conversation[]>
  getById(accountId: string, conversationId: string): Promise<Conversation | undefined>

  // WRITE
  upsert(conversation: Conversation): Promise<void>
  bulkUpsert(conversations: Conversation[]): Promise<void>

  // DELETE
  delete(accountId: string, conversationId: string): Promise<void>
  clearByAccount(accountId: string): Promise<void>
}
