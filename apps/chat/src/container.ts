import { AccountDexieDB, AccountService, DexieAccountRepository } from '@/modules/account'
import { FactoryContract, UserContract } from '@/modules/blockchain'
import {
  ConversationDexieDB,
  ConversationService,
  DexieConversationRepository
} from '@/modules/conversation'
import { NativeWalletAdapter, WalletService } from '@/modules/wallet'
import { EventLogContainer } from './modules/eventlogs'

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
  /* ================================
   * Application services
   * ================================ */
  private readonly _accountService: AccountService
  private readonly _conversationService: ConversationService

  constructor() {
    const nativeWalletAdapter = new NativeWalletAdapter()
    this._walletService = new WalletService(nativeWalletAdapter)
    this._factoryContract = new FactoryContract()
    this._userContract = new UserContract()
    this._eventLogContainer = new EventLogContainer()

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

  get eventLogContainer(): EventLogContainer {
    return this._eventLogContainer
  }
}

/**
 * Singleton container instance
 * ----------------------------
 * JS module guarantee: chỉ khởi tạo 1 lần
 */
export const container = new AppContainer()
