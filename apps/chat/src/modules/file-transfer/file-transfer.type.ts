/**
 * file-transfer.type.ts
 * ====================
 * Định nghĩa type cho file transfer module
 */

/**
 * FileMetadata
 * Thông tin file được gửi/nhận
 */
export interface FileMetadata {
  id: string // Unique identifier
  name: string // File name
  mimeType: string // MIME type (e.g., 'image/png')
  size: number // File size in bytes
  checksum: string // SHA-256 checksum
  createdAt: number // Timestamp (ms)
  senderId: string // Profile ID of sender
  receiverId: string // Profile ID of receiver
  conversationId: string // Conversation ID
  sessionId: string // RealtimeTransport session ID
  status: FileTransferStatus
  progress: number // 0-100 percentage
  error?: string // Error message if failed
}

/**
 * FileTransferStatus
 * Trạng thái file transfer
 */
export enum FileTransferStatus {
  PENDING = 'pending', // Waiting to start
  PREPARING = 'preparing', // Preparing file
  TRANSFERRING = 'transferring', // In progress
  COMPLETED = 'completed', // Successfully transferred
  FAILED = 'failed', // Failed to transfer
  CANCELLED = 'cancelled' // User cancelled
}

/**
 * FileChunk
 * Một phần của file được gửi
 */
export interface FileChunk {
  fileId: string // Parent file ID
  chunkIndex: number // Index trong sequence
  totalChunks: number // Tổng số chunks
  data: Uint8Array // Dữ liệu chunk
  checksum: string // Checksum của chunk này
}

/**
 * FileTransferProgress
 * Thông tin tiến độ transfer
 */
export interface FileTransferProgress {
  fileId: string
  fileName: string
  bytesTransferred: number
  totalBytes: number
  percentage: number // 0-100
  chunksCompleted: number
  totalChunks: number
  status: FileTransferStatus
  speed?: number // bytes/sec
  estimatedTimeRemaining?: number // milliseconds
}

/**
 * FileTransferError
 * Lỗi xảy ra trong transfer
 */
export interface FileTransferError {
  code: string
  message: string
  fileId?: string
  chunkIndex?: number
  details?: Record<string, unknown>
}

/**
 * FileTransferOptions
 * Tuỳ chọn khi gửi file
 */
export interface FileTransferOptions {
  chunkSize?: number // Default: 16KB (16384 bytes)
  maxRetries?: number // Default: 3
  retryDelayMs?: number // Default: 1000
  timeoutMs?: number // Default: 30000
  calculateChecksum?: boolean // Default: true
  persistToIndexedDB?: boolean // Default: true
}

/**
 * FileTransferPort
 * Interface cho service
 */
export interface FileTransferPort {
  /**
   * Chuẩn bị & gửi file
   * - Validate file
   * - Tính checksum
   * - Chunk file
   * - Gửi via realtime-transport
   */
  sendFile(
    file: File,
    receiverId: string,
    conversationId: string,
    options?: FileTransferOptions
  ): Promise<FileMetadata>

  /**
   * Nhận file
   * - Accept incoming transfer
   * - Collect chunks
   * - Assemble & validate
   * - Save to IndexedDB
   */
  receiveFile(sessionId: string, receivedMetadata: FileMetadata): Promise<Blob>

  /**
   * Hủy transfer
   */
  cancelTransfer(fileId: string): Promise<void>

  /**
   * Lấy metadata của file
   */
  getFileMetadata(fileId: string): Promise<FileMetadata | null>

  /**
   * Lấy danh sách files của conversation
   */
  getConversationFiles(conversationId: string): Promise<FileMetadata[]>

  /**
   * Xoá file từ storage
   */
  deleteFile(fileId: string): Promise<void>

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (progress: FileTransferProgress) => void): () => void

  /**
   * Subscribe to errors
   */
  onError(callback: (error: FileTransferError) => void): () => void
}

/**
 * FileChunkerPort
 * Interface cho chunking utility
 */
export interface FileChunkerPort {
  /**
   * Split file thành chunks
   */
  split(file: File, chunkSize?: number): Promise<Uint8Array[]>

  /**
   * Combine chunks thành file
   */
  combine(chunks: Uint8Array[]): Promise<Blob>

  /**
   * Calculate SHA-256 checksum
   */
  calculateChecksum(data: Uint8Array | File): Promise<string>

  /**
   * Validate chunk checksum
   */
  validateChecksum(data: Uint8Array, expectedChecksum: string): Promise<boolean>
}

/**
 * FileMetadataRepositoryPort
 * Interface cho persistence
 */
export interface FileMetadataRepositoryPort {
  /**
   * Lưu metadata
   */
  save(metadata: FileMetadata): Promise<void>

  /**
   * Lấy metadata by ID
   */
  findById(id: string): Promise<FileMetadata | null>

  /**
   * Lấy files của conversation
   */
  findByConversationId(conversationId: string): Promise<FileMetadata[]>

  /**
   * Update metadata (status, progress, etc.)
   */
  update(metadata: FileMetadata): Promise<void>

  /**
   * Xoá metadata
   */
  delete(id: string): Promise<void>

  /**
   * Clear all files của conversation
   */
  clearConversation(conversationId: string): Promise<void>
}
