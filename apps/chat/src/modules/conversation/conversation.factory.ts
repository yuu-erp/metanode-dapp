import type {
  EkycContract,
  FactoryContract,
  GroupContract,
  UserContract,
  VerifyContract
} from '@/modules/blockchain'
import type { FileCacheService } from '@/modules/file-cache'
import type { WalletService } from '@/modules/wallet'
import type { AnonymousGroupContract } from '../blockchain/anonymous-group-contract'
import type { EventLogContainer } from '../eventlogs'
import { ConversationService } from './conversation.service'
import { ConversationDexieDB } from './infrastructure/indexeddb/conversation.indexeddb'
import { DexieConversationRepository } from './infrastructure/indexeddb/dexie-conversation.repository'

export class ConversationFactory {
  static dbName = 'conversations'

  static createService(
    userContract: UserContract,
    factoryContract: FactoryContract,
    groupContract: GroupContract,
    walletService: WalletService,
    fileCacheService: FileCacheService,
    eventLogContainer: EventLogContainer,
    anonymousGroupContract: AnonymousGroupContract,
    verifyContract: VerifyContract,
    ekycContract: EkycContract
  ): ConversationService {
    const db = new ConversationDexieDB(this.dbName)
    const repository = new DexieConversationRepository(db)
    return new ConversationService(
      repository,
      userContract,
      factoryContract,
      groupContract,
      walletService,
      fileCacheService,
      eventLogContainer,
      anonymousGroupContract,
      verifyContract,
      ekycContract
    )
  }
}
