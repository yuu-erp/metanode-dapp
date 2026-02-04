import { Dexie, type Table } from 'dexie'
import type { FileCache } from '../../file-cache.type'

export interface FileCacheDB {
  files: Table<FileCache, string>
}

export class FileCacheDexieDB extends Dexie implements FileCacheDB {
  files!: Table<FileCache, string>

  constructor(dbName = 'file_cache_db') {
    super(dbName)
    this.version(1).stores({
      files: 'id, timestamp'
    })
  }
}
