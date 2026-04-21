import type { FileCacheDB } from './file-cache.indexeddb'
import type { FileCache } from '../../file-cache.type'

export class DexieFileCacheRepository {
  constructor(private readonly db: FileCacheDB) {}

  async save(file: FileCache): Promise<void> {
    await this.db.files.put(file)
  }

  async get(id: string): Promise<FileCache | undefined> {
    return this.db.files.get(id)
  }
}
