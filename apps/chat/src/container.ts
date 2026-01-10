import { AccountDexieDB, AccountService, DexieAccountRepository } from '@/modules/account'
import { FactoryContract, UserContract } from '@/modules/blockchain'
import {
  ConversationDexieDB,
  ConversationService,
  DexieConversationRepository
} from '@/modules/conversation'
import { EventLogContainer } from '@/modules/eventlogs'
import { MessageService } from '@/modules/message'
import { NativeWalletAdapter, WalletService } from '@/modules/wallet'
import { MittEventBus, type EventBusPort } from './modules/event'
import type { AppEvents } from './types/app-events'

/**
 * AppContainer
 * -------------
 * - Composition Root của toàn bộ application
 * - Chịu trách nhiệm khởi tạo & quản lý dependency
 * - Singleton runtime
 */
class AppContainer {
  /* ================================
   * Infra / Low-level services
   * ================================ */
  private readonly _walletService: WalletService
  private readonly _factoryContract: FactoryContract
  private readonly _userContract: UserContract
  private readonly _eventLogContainer: EventLogContainer
  private readonly _eventBus: EventBusPort<AppEvents>
  /* ================================
   * Application services
   * ================================ */
  private readonly _accountService: AccountService
  private readonly _conversationService: ConversationService
  private readonly _messageService: MessageService

  constructor() {
    const nativeWalletAdapter = new NativeWalletAdapter()
    this._walletService = new WalletService(nativeWalletAdapter)
    this._factoryContract = new FactoryContract()
    this._userContract = new UserContract()
    this._eventLogContainer = new EventLogContainer()
    this._eventBus = new MittEventBus<AppEvents>()
    // 5️⃣ Application Service (AccountService)
    const dbAccount = new AccountDexieDB(`accounts`)
    const accountRepository = new DexieAccountRepository(dbAccount)
    this._accountService = new AccountService(
      this._walletService,
      accountRepository,
      this._factoryContract,
      this._userContract
    )

    // 5️⃣ Application Service (ConversationService)
    const dbConversation = new ConversationDexieDB(`conversations`)
    const conversationRepository = new DexieConversationRepository(dbConversation)
    this._conversationService = new ConversationService(
      conversationRepository,
      this._userContract,
      this._walletService
    )

    // 5️⃣ Application Service (MessageService)
    this._messageService = new MessageService(
      this._userContract,
      this._walletService,
      this._eventBus
    )
  }

  /* ================================
   * Public getters (read-only)
   * ================================ */

  get walletService(): WalletService {
    return this._walletService
  }

  get factoryContract(): FactoryContract {
    return this._factoryContract
  }

  get userContract(): UserContract {
    return this._userContract
  }

  get accountService(): AccountService {
    return this._accountService
  }

  get conversationService(): ConversationService {
    return this._conversationService
  }

  get messageService(): MessageService {
    return this._messageService
  }

  get eventLogContainer(): EventLogContainer {
    return this._eventLogContainer
  }

  get eventBus(): EventBusPort<AppEvents> {
    return this._eventBus
  }
}

/**
 * Singleton container instance
 * ----------------------------
 * JS module guarantee: chỉ khởi tạo 1 lần
 */
export const container = new AppContainer()
