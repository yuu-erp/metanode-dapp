import { Dexie, type Table } from 'dexie'
import type { Message } from '../../message.type'

export interface MessageDB {
  messages: Table<Message, string>
}

export class MessageDexieDB extends Dexie implements MessageDB {
  messages!: Table<Message, string>

  constructor(dbName = 'message_db') {
    super(dbName)

    this.version(1).stores({
      messages: `
        id,
        clientId,
        accountId,
        conversationId,
        status,
        timestamp,
        [accountId+id],
        [accountId+clientId],
        [accountId+conversationId+timestamp],
        [accountId+conversationId+status]
      `
    })
  }
}
