import { FileCacheService } from './file-cache.service'
import { FileCacheDexieDB } from './infrastructure/indexeddb/file-cache.indexeddb'
import { DexieFileCacheRepository } from './infrastructure/indexeddb/dexie-file-cache.repository'

export class FileCacheFactory {
  static createService(): FileCacheService {
    const db = new FileCacheDexieDB()
    const repository = new DexieFileCacheRepository(db)
    return new FileCacheService(repository)
  }
}
