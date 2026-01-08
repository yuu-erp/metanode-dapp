import type { Message } from './message.type'

export interface MessageRepository {
  getMessagesByAccount(accountId: string, conversationId: string): Promise<Message[]>
  getMessageById(accountId: string, messageId: string): Promise<Message | null>

  upsert(message: Message): Promise<void>
}
