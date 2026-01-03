import { Dexie, type Table } from 'dexie'
import type { Message } from '../../message.type'

export interface MessageDB {
  messages: Table<Message>
}

export class MessageDexieDB extends Dexie implements MessageDB {
  messages!: Table<Message>

  constructor(dbName = 'messages_db') {
    super(dbName)

    this.version(1).stores({
      // Primary key + indexes
      conversations: 'conversationId, updatedAt, conversationType'
    })
  }
}
