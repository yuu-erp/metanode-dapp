import { Dexie, type Table } from 'dexie'
import type { PinnedMessage } from '../../message-pin.entity'

export interface MessagePinDB {
  pinnedMessages: Table<PinnedMessage, string>
}

export class MessagePinDexieDB extends Dexie implements MessagePinDB {
  pinnedMessages!: Table<PinnedMessage, string>

  constructor(dbName = 'message_pin_db') {
    super(dbName)

    this.version(1).stores({
      pinnedMessages: '++id, [accountId+conversationId], messageId, pinnedAt'
    })
  }
}
