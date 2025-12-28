import { Dexie, type Table } from 'dexie'
import type { Conversation } from '../../domain'

export interface ConversationDB {
  conversations: Table<Conversation>
}

export class ConversationDexieDB extends Dexie implements ConversationDB {
  conversations!: Table<Conversation>

  constructor(dbName = 'conversation_db') {
    super(dbName)

    this.version(1).stores({
      // Primary key + indexes
      conversations: 'conversationId, updatedAt, conversationType'
    })
  }
}
