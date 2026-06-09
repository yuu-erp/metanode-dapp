import type { Account } from '@/modules/account'
import mitt from 'mitt'
import type { SyncStrategy } from './sync.strategy'

type SyncStatus = 'idle' | 'running' | 'stopped' | 'error' | 'connecting'

type SyncEvents = {
  statusChange: { strategy: string; status: SyncStatus }
  error: { strategy: string; error: unknown }
}

export class SyncManager {
  private _strategies = new Map<string, SyncStrategy>()
  private _timers = new Map<string, ReturnType<typeof setInterval>>()
  private _running = new Map<string, boolean>()
  private _statuses = new Map<string, SyncStatus>()
  private _account: Account | null = null
  private _emitter = mitt<SyncEvents>()
  private _isOnline: boolean = typeof window !== 'undefined' ? window.navigator.onLine : true

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this._handleNetworkChange(true))
      window.addEventListener('offline', () => this._handleNetworkChange(false))
    }
  }

  public registerStrategy(strategy: SyncStrategy) {
    if (this._strategies.has(strategy.name)) {
      console.warn(`[SyncManager] Strategy ${strategy.name} already registered`)
      return
    }
    this._strategies.set(strategy.name, strategy)
  }

  public get events() {
    return this._emitter
  }

  public get account() {
    return this._account
  }

  public getStatuses(): Record<string, SyncStatus> {
    const statuses: Record<string, SyncStatus> = {}
    this._strategies.forEach((s) => {
      statuses[s.name] = this._statuses.get(s.name) ?? 'idle'
    })
    return statuses
  }

  /**
   * Start all sync tasks for the given account.
   * If already running for the same account, do nothing.
   * If running for a different account, restart.
   */
  public start(account: Account) {
    if (this._account?.address === account.address) {
      return // Already running for this account
    }

    if (this._account) {
      this.stop() // Stop previous account tasks
    }

    this._account = account
    console.log(`[SyncManager] Starting sync for ${account.address}`)

    this._strategies.forEach((strategy) => {
      this._scheduleStrategy(strategy, account)
    })
  }

  /**
   * Stop all sync tasks and clear context
   */
  public stop() {
    console.log(`[SyncManager] Stopping all tasks`)
    this._timers.forEach((timer) => clearInterval(timer))
    this._timers.clear()
    this._running.clear()
    this._statuses.clear()
    this._account = null

    // Notify all stopped
    this._strategies.forEach((s) => {
      this._statuses.set(s.name, 'stopped')
      this._emitter.emit('statusChange', { strategy: s.name, status: 'stopped' })
    })
  }

  private _handleNetworkChange(isOnline: boolean) {
    this._isOnline = isOnline
    if (!isOnline) {
      // Set all running/idle strategies to connecting
      this._strategies.forEach((strategy) => {
        const currentStatus = this._statuses.get(strategy.name)
        if (currentStatus !== 'stopped') {
          this._statuses.set(strategy.name, 'connecting')
          this._emitter.emit('statusChange', { strategy: strategy.name, status: 'connecting' })
        }
      })
    } else if (this._account) {
      // Re-trigger sync for all strategies when back online
      this._strategies.forEach((strategy) => {
        this._executeStrategy(strategy, this._account!)
      })
    }
  }

  private _scheduleStrategy(strategy: SyncStrategy, account: Account) {
    // Run immediately first time
    this._executeStrategy(strategy, account)

    // Schedule interval
    const timer = setInterval(() => {
      this._executeStrategy(strategy, account)
    }, strategy.interval)

    this._timers.set(strategy.name, timer)
  }

  private async _executeStrategy(strategy: SyncStrategy, account: Account) {
    console.log(`[SyncManager] Executing ${strategy.name} for ${account.address}`)
    return
    if (!this._isOnline) {
      console.log(`[SyncManager] Offline, skipping ${strategy.name}`)
      this._statuses.set(strategy.name, 'connecting')
      this._emitter.emit('statusChange', { strategy: strategy.name, status: 'connecting' })
      return
    }

    // Prevent overlapping runs
    if (this._running.get(strategy.name)) {
      console.log(`[SyncManager] ${strategy.name} is already running, skipping.`)
      return
    }

    this._running.set(strategy.name, true)
    this._statuses.set(strategy.name, 'running')
    this._emitter.emit('statusChange', { strategy: strategy.name, status: 'running' })

    try {
      if (this._account?.address !== account.address) {
        // Account changed mid-execution check
        return
      }
      await strategy.sync(account)

      // If we went offline during sync, keep status as connecting
      if (!this._isOnline) {
        this._statuses.set(strategy.name, 'connecting')
        this._emitter.emit('statusChange', { strategy: strategy.name, status: 'connecting' })
        return
      }

      this._statuses.set(strategy.name, 'idle')
      this._emitter.emit('statusChange', { strategy: strategy.name, status: 'idle' })
    } catch (error) {
      if (!this._isOnline) {
        // Suppress error if we are offline, just keep connecting status
        this._statuses.set(strategy.name, 'connecting')
        this._emitter.emit('statusChange', { strategy: strategy.name, status: 'connecting' })
        return
      }

      console.error(`[SyncManager] Error in ${strategy.name}:`, error)
      this._emitter.emit('error', { strategy: strategy.name, error })
      this._statuses.set(strategy.name, 'error')
      this._emitter.emit('statusChange', { strategy: strategy.name, status: 'error' })
    } finally {
      this._running.set(strategy.name, false)
    }
  }
}
