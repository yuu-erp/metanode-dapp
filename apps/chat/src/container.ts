import { NativeWalletAdapter, WalletService } from '@/modules/wallet'
import { FactoryContract, UserContract } from '@/modules/blockchain'
import { AccountDexieDB, AccountService, DexieAccountRepository } from '@/modules/account'
import {
  ConversationDexieDB,
  ConversationService,
  DexieConversationRepository
} from '@/modules/conversation'

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

  // Wallet service core (dùng NativeWalletAdapter)
  private readonly _walletService: WalletService
  // Blockchain contract (Factory)
  private readonly _factoryContract: FactoryContract
  // Blockchain contract (User)
  private readonly _userContract: UserContract
  /* ================================
   * Application services
   * ================================ */

  // AccountService: xử lý business logic account
  private readonly _accountService: AccountService

  // ConversationService: xử lý business chat ( conversations )
  private readonly _conversationService: ConversationService

  constructor() {
    // 1️⃣ Adapter implementing WalletAdapter interface (cổng giao tiếp với native wallet)
    const nativeWalletAdapter = new NativeWalletAdapter()
    // 2️⃣ Infra / Service core: xử lý tất cả logic liên quan wallet
    this._walletService = new WalletService(nativeWalletAdapter)
    // 3️⃣ Infra / Blockchain contract
    this._factoryContract = new FactoryContract()
    // 3️⃣ Infra / Blockchain contract
    this._userContract = new UserContract()

    // 5️⃣ Application Service (AccountService)
    // → phụ thuộc WalletService, AccountRepository, FactoryContract, UserConract
    const dbAccount = new AccountDexieDB(`accounts_db`)
    const accountRepository = new DexieAccountRepository(dbAccount)
    this._accountService = new AccountService(
      this._walletService,
      accountRepository,
      this._factoryContract,
      this._userContract
    )

    // 5️⃣ Application Service (ConversationService)
    // → phụ thuộc WalletService, AccountRepository, FactoryContract, UserConract
    const dbConversation = new ConversationDexieDB(`conversations_db`)
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

  get accountService(): AccountService {
    return this._accountService
  }

  get conversationService(): ConversationService {
    return this._conversationService
  }
}

/**
 * Singleton container instance
 * ----------------------------
 * JS module guarantee: chỉ khởi tạo 1 lần
 */
export const container = new AppContainer()
