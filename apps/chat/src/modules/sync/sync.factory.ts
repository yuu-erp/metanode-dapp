import { SyncManager } from './sync.manager'

export class SyncFactory {
  static createManager(): SyncManager {
    return new SyncManager()
  }
}
