/**
 * file-metadata.repository.ts
 * ===========================
 * Persistence layer cho file metadata
 * Sử dụng IndexedDB via Dexie
 */

import Dexie, { type Table } from 'dexie'
import type { FileMetadata, FileMetadataRepositoryPort } from './file-transfer.type'

/**
 * Dexie Database cho file metadata
 */
class FileMetadataDexieDB extends Dexie {
  fileMetadata!: Table<FileMetadata>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      fileMetadata: '++id, conversationId, senderId, receiverId, createdAt'
    })
  }
}

/**
 * FileMetadataRepository
 * Quản lý persistence của file metadata
 */
export class FileMetadataRepository implements FileMetadataRepositoryPort {
  private readonly db: FileMetadataDexieDB

  constructor(db: FileMetadataDexieDB) {
    this.db = db
  }

  /**
   * Lưu metadata mới
   */
  async save(metadata: FileMetadata): Promise<void> {
    await this.db.fileMetadata.add(metadata)
  }

  /**
   * Lấy metadata by ID
   */
  async findById(id: string): Promise<FileMetadata | null> {
    const result = await this.db.fileMetadata.get(id)
    return result ?? null
  }

  /**
   * Lấy files của conversation
   */
  async findByConversationId(conversationId: string): Promise<FileMetadata[]> {
    return this.db.fileMetadata.where('conversationId').equals(conversationId).toArray()
  }

  /**
   * Update metadata
   * (e.g., status, progress, error)
   */
  async update(metadata: FileMetadata): Promise<void> {
    await this.db.fileMetadata.update(metadata.id, {
      status: metadata.status,
      progress: metadata.progress,
      error: metadata.error
    })
  }

  /**
   * Xoá metadata
   */
  async delete(id: string): Promise<void> {
    await this.db.fileMetadata.delete(id)
  }

  /**
   * Clear all files của conversation
   */
  async clearConversation(conversationId: string): Promise<void> {
    await this.db.fileMetadata.where('conversationId').equals(conversationId).delete()
  }
}

/**
 * Factory function để tạo FileMetadataRepository
 */
export function createFileMetadataRepository(): FileMetadataRepository {
  const db = new FileMetadataDexieDB('file_metadata_store')
  return new FileMetadataRepository(db)
}
