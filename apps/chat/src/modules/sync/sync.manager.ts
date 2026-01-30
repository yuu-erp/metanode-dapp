import type { Account } from '@/modules/account'
import mitt from 'mitt'
import type { SyncStrategy } from './sync.strategy'

type SyncStatus = 'idle' | 'running' | 'stopped' | 'error'

type SyncEvents = {
  statusChange: { strategy: string; status: SyncStatus }
  error: { strategy: string; error: unknown }
}

export class SyncManager {
  private _strategies = new Map<string, SyncStrategy>()
  private _timers = new Map<string, ReturnType<typeof setInterval>>()
  private _running = new Map<string, boolean>()
  private _account: Account | null = null
  private _emitter = mitt<SyncEvents>()

  constructor() {}

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
    this._account = null

    // Notify all stopped
    this._strategies.forEach((s) => {
      this._emitter.emit('statusChange', { strategy: s.name, status: 'stopped' })
    })
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
    // Prevent overlapping runs
    if (this._running.get(strategy.name)) return

    this._running.set(strategy.name, true)
    this._emitter.emit('statusChange', { strategy: strategy.name, status: 'running' })

    try {
      if (this._account?.address !== account.address) {
        // Account changed mid-execution check
        return
      }
      await strategy.sync(account)
      this._emitter.emit('statusChange', { strategy: strategy.name, status: 'idle' })
    } catch (error) {
      console.error(`[SyncManager] Error in ${strategy.name}:`, error)
      this._emitter.emit('error', { strategy: strategy.name, error })
      this._emitter.emit('statusChange', { strategy: strategy.name, status: 'error' })
    } finally {
      this._running.set(strategy.name, false)
    }
  }
}
