import { MessagePinService } from './message-pin.service'
import { MessagePinDexieDB } from './infrastructure/indexeddb/message-pin.indexeddb'
import { DexieMessagePinRepository } from './infrastructure/indexeddb/dexie-message-pin.repository'

export class MessagePinFactory {
  static createService(): MessagePinService {
    const db = new MessagePinDexieDB()
    const repository = new DexieMessagePinRepository(db)
    return new MessagePinService(repository)
  }
}
