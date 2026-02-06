import { AccountFactory, AccountService, AccountSyncStrategy } from '@/modules/account'
import {
  FactoryContract,
  FileContract,
  GroupContract,
  MettingContract,
  UserContract
} from '@/modules/blockchain'
import { CallService } from '@/modules/call'
import {
  ConversationFactory,
  ConversationService,
  ConversationSyncStrategy
} from '@/modules/conversation'
import { MittEventBus, type EventBusPort } from '@/modules/event'
import { FileCacheFactory, FileCacheService } from '@/modules/file-cache'
import { FileTransferService } from '@/modules/file-transfer'
import { MessageFactory, MessageService } from '@/modules/message'
import { MessagePinFactory, MessagePinService } from '@/modules/message-pin'
import type { SessionManager, TransportService } from '@/modules/realtime-transport'
import {
  getRealtimeTransportFactory,
  type RealtimeTransportFactory
} from '@/modules/realtime-transport/realtime-transport.factory'
import { SyncFactory, SyncManager } from '@/modules/sync'
import { NativeWalletAdapter, WalletService } from '@/modules/wallet'
import type { AppEvents } from './types/app-events'
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
  private readonly _groupContract: GroupContract
  private readonly _fileContract: FileContract
  private readonly _mettingContract: MettingContract
  private readonly _eventLogContainer: EventLogContainer
  private readonly _eventBus: EventBusPort<AppEvents>
  /* ================================
   * Application services
   * ================================ */
  private readonly _accountService: AccountService
  private readonly _conversationService: ConversationService
  private readonly _messageService: MessageService
  private readonly _callService: CallService
  private readonly _fileTransferService: FileTransferService
  private readonly _fileCacheService: FileCacheService
  private readonly _messagePinService: MessagePinService
  private readonly _realtimeTransportFactory: RealtimeTransportFactory

  constructor() {
    const nativeWalletAdapter = new NativeWalletAdapter()
    this._walletService = new WalletService(nativeWalletAdapter)
    this._factoryContract = new FactoryContract()
    this._userContract = new UserContract()
    this._groupContract = new GroupContract()
    this._fileContract = new FileContract()
    this._mettingContract = new MettingContract()
    this._eventLogContainer = new EventLogContainer()
    this._eventBus = new MittEventBus<AppEvents>()

    // 5️⃣ Application Service (AccountService)
    this._accountService = AccountFactory.createService(
      this._walletService,
      this._factoryContract,
      this._userContract
    )

    // File Cache initialization
    this._fileCacheService = FileCacheFactory.createService()

    // 5️⃣ Application Service (ConversationService)
    this._conversationService = ConversationFactory.createService(
      this._userContract,
      this._factoryContract,
      this._groupContract,
      this._walletService,
      this._fileCacheService,
      this._eventLogContainer
    )

    this._messageService = MessageFactory.createService(
      this._userContract,
      this._fileContract,
      this._walletService,
      this._eventBus,
      this._fileCacheService
    )

    this._fileTransferService = new FileTransferService()
    this._messagePinService = MessagePinFactory.createService()
    this._callService = new CallService(
      this._mettingContract,
      this._userContract,
      this._factoryContract,
      this._eventLogContainer
    )

    // 6️⃣ Realtime Transport Factory
    this._realtimeTransportFactory = getRealtimeTransportFactory()
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

  get mettingContract(): MettingContract {
    return this._mettingContract
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

  get fileTransferService(): FileTransferService {
    return this._fileTransferService
  }

  get fileCacheService(): FileCacheService {
    return this._fileCacheService
  }

  get messagePinService(): MessagePinService {
    return this._messagePinService
  }

  get callService(): CallService {
    return this._callService
  }

  get eventLogContainer(): EventLogContainer {
    return this._eventLogContainer
  }

  get eventBus(): EventBusPort<AppEvents> {
    return this._eventBus
  }

  get transportService(): TransportService {
    return this._realtimeTransportFactory.transportService
  }

  get sessionManager(): SessionManager {
    return this._realtimeTransportFactory.sessionManager
  }

  /* ================================
   * Sync Manager
   * ================================ */
  private _syncManager: SyncManager | undefined

  get syncManager(): SyncManager {
    if (!this._syncManager) {
      this._syncManager = SyncFactory.createManager()

      // Register Strategies
      const conversationSync = new ConversationSyncStrategy(
        this._conversationService,
        (account) => {
          import('@/shared/lib/react-query').then(({ queryClient, CONVERSATION_QUERY_KEY }) => {
            queryClient.invalidateQueries({
              queryKey: CONVERSATION_QUERY_KEY.CONVERSATIONS(account.address)
            })
          })
        }
      )

      this._syncManager.registerStrategy(conversationSync)

      const accountSync = new AccountSyncStrategy(this._accountService)
      this._syncManager.registerStrategy(accountSync)
    }
    return this._syncManager
  }
}

/**
 * Singleton container instance
 * ----------------------------
 * JS module guarantee: chỉ khởi tạo 1 lần
 */
export const container = new AppContainer()
