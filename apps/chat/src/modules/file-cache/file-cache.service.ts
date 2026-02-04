import type { DexieFileCacheRepository } from './infrastructure/indexeddb/dexie-file-cache.repository'
import type { FileCache } from './file-cache.type'

export class FileCacheService {
  constructor(private readonly repository: DexieFileCacheRepository) {}

  async saveFile(
    fileKey: string,
    base64: string,
    mimeType: string,
    fileName: string
  ): Promise<void> {
    await this.repository.save({
      id: fileKey,
      base64,
      mimeType,
      fileName,
      timestamp: Date.now()
    })
  }

  async getFile(fileKey: string): Promise<FileCache | undefined> {
    return this.repository.get(fileKey)
  }
}
