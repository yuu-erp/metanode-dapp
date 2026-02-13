import type {
  FactoryContract,
  FileContract,
  GroupContract,
  UserContract
} from '@/modules/blockchain'
import type { EventBusPort } from '@/modules/event'
import type { WalletService } from '@/modules/wallet'
import type { AppEvents } from '@/types/app-events'
import type { FileCacheService } from '../file-cache'
import { MessageService } from './message.service'
import type { EventLogContainer } from '../eventlogs'

export class MessageFactory {
  static createService(
    userContract: UserContract,
    groupContract: GroupContract,
    factoryContract: FactoryContract,
    fileContract: FileContract,
    walletService: WalletService,
    eventBus: EventBusPort<AppEvents>,
    fileCacheService: FileCacheService,
    eventLogContainer: EventLogContainer
  ): MessageService {
    return new MessageService(
      userContract,
      groupContract,
      factoryContract,
      fileContract,
      walletService,
      eventBus,
      fileCacheService,
      eventLogContainer
    )
  }
}
