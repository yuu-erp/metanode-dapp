import { MessageService } from './message.service'
import type { FileContract, UserContract } from '@/modules/blockchain'
import type { WalletService } from '@/modules/wallet'
import type { EventBusPort } from '@/modules/event'
import type { AppEvents } from '@/types/app-events'
import type { FileCacheService } from '../file-cache'

export class MessageFactory {
  static createService(
    userContract: UserContract,
    fileContract: FileContract,
    walletService: WalletService,
    eventBus: EventBusPort<AppEvents>,
    fileCacheService: FileCacheService
  ): MessageService {
    return new MessageService(userContract, fileContract, walletService, eventBus, fileCacheService)
  }
}
