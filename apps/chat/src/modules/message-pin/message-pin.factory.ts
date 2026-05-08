import { MessagePinService } from './message-pin.service'
import { MessagePinDexieDB } from './infrastructure/indexeddb/message-pin.indexeddb'
import { DexieMessagePinRepository } from './infrastructure/indexeddb/dexie-message-pin.repository'
import type { Contracts } from '../blockchain/contracts'

export class MessagePinFactory {
  static createService(contracts: Contracts): MessagePinService {
    const db = new MessagePinDexieDB()
    const repository = new DexieMessagePinRepository(db)
    return new MessagePinService(repository, contracts)
  }
}
