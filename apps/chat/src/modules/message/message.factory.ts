import { MessageService } from './message.service'
import type { FileContract, UserContract } from '@/modules/blockchain'
import type { WalletService } from '@/modules/wallet'
import type { EventBusPort } from '@/modules/event'
import type { AppEvents } from '@/types/app-events'

export class MessageFactory {
  static createService(
    userContract: UserContract,
    fileContract: FileContract,
    walletService: WalletService,
    eventBus: EventBusPort<AppEvents>
  ): MessageService {
    return new MessageService(userContract, fileContract, walletService, eventBus)
  }
}
