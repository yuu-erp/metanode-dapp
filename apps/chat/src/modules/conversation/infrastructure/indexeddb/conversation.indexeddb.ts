import { Dexie, type Table } from 'dexie'
import type { Conversation } from '../../conversation.type'

export interface ConversationDB {
  conversations: Table<Conversation, string> // string = conversationId
}

export class ConversationDexieDB extends Dexie implements ConversationDB {
  conversations!: Table<Conversation, string>

  constructor(dbName = 'conversations') {
    super(dbName)

    this.version(12)
      .stores({
        conversations: `
        conversationId,
        accountId,
        updatedAt,
        conversationType,
        [accountId+conversationId],
        [accountId+updatedAt]
      `
      })
      .upgrade(async () => {})
  }
}
