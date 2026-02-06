import { ConversationDexieDB } from './infrastructure/indexeddb/conversation.indexeddb'
import { DexieConversationRepository } from './infrastructure/indexeddb/dexie-conversation.repository'
import { ConversationService } from './conversation.service'
import type { FactoryContract, GroupContract, UserContract } from '@/modules/blockchain'
import type { WalletService } from '@/modules/wallet'
import type { FileCacheService } from '@/modules/file-cache'
import type { EventLogContainer } from '../eventlogs'

export class ConversationFactory {
  static createService(
    userContract: UserContract,
    factoryContract: FactoryContract,
    groupContract: GroupContract,
    walletService: WalletService,
    fileCacheService: FileCacheService,
    eventLogContainer: EventLogContainer
  ): ConversationService {
    const db = new ConversationDexieDB('conversations')
    const repository = new DexieConversationRepository(db)
    return new ConversationService(
      repository,
      userContract,
      factoryContract,
      groupContract,
      walletService,
      fileCacheService,
      eventLogContainer
    )
  }
}
