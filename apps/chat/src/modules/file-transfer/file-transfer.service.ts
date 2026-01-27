/**
 * file-transfer.service.ts
 * ========================
 * Business logic cho file transfer
 * Sử dụng realtime-transport infrastructure
 */

import type {
  FileMetadata,
  FileTransferError,
  FileTransferOptions,
  FileTransferPort,
  FileTransferProgress,
  FileTransferStatus,
  FileChunk
} from './file-transfer.type'
import { FileChunker } from './file-chunker'
import { FileMetadataRepository } from './file-metadata.repository'
import { FileTransferStatus as Status } from './file-transfer.type'
import type { SessionManager, TransportService } from '@/modules/realtime-transport'

/**
 * Default options
 */
const DEFAULT_OPTIONS: Required<FileTransferOptions> = {
  chunkSize: 16 * 1024, // 16KB
  maxRetries: 3,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  calculateChecksum: true,
  persistToIndexedDB: true
}

/**
 * FileTransferService
 * Orchestrates file sending/receiving via realtime-transport
 */
export class FileTransferService implements FileTransferPort {
  private readonly chunker: FileChunker
  private readonly repository: FileMetadataRepository
  private readonly sessionManager: SessionManager
  private readonly transportService: TransportService

  // Event listeners
  private progressCallbacks: Set<(progress: FileTransferProgress) => void> = new Set()
  private errorCallbacks: Set<(error: FileTransferError) => void> = new Set()

  // Active transfers (tracking)
  private activeTransfers: Map<string, AbortController> = new Map()

  constructor(
    chunker: FileChunker,
    repository: FileMetadataRepository,
    sessionManager: SessionManager,
    transportService: TransportService
  ) {
    this.chunker = chunker
    this.repository = repository
    this.sessionManager = sessionManager
    this.transportService = transportService
  }

  /**
   * Send file to receiver
   */
  async sendFile(
    file: File,
    receiverId: string,
    conversationId: string,
    options?: FileTransferOptions
  ): Promise<FileMetadata> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const fileId = this.generateId()
    const abortController = new AbortController()
    this.activeTransfers.set(fileId, abortController)

    try {
      // 1️⃣ Prepare file metadata
      const metadata: FileMetadata = {
        id: fileId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        checksum: '',
        createdAt: Date.now(),
        senderId: '', // Will be set by hook
        receiverId,
        conversationId,
        sessionId: '',
        status: Status.PREPARING,
        progress: 0
      }

      await this.updateProgress(fileId, Status.PREPARING, 0)

      // 2️⃣ Calculate checksum if needed
      if (opts.calculateChecksum) {
        metadata.checksum = await this.chunker.calculateChecksum(file)
      }

      // 3️⃣ Split file into chunks
      const chunks = await this.chunker.split(file, opts.chunkSize)
      const totalChunks = chunks.length

      // 4️⃣ Create realtime session
      // Note: receiverId sẽ được map tới participantId ở React component
      const session = await this.sessionManager.createSession({
        participantId: receiverId,
        conversationId,
        connectionType: 'duplex',
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] }
        ]
      })

      metadata.sessionId = session.sessionId
      const dataChannel = await this.transportService.createDataChannel(session, 'file-transfer')

      // 5️⃣ Send metadata first
      await this.sendMessage(dataChannel, {
        type: 'file-metadata',
        data: metadata
      })

      // 6️⃣ Send chunks
      await this.updateProgress(fileId, Status.TRANSFERRING, 0)

      for (let i = 0; i < totalChunks; i++) {
        if (abortController.signal.aborted) {
          throw new Error('Transfer cancelled')
        }

        const chunkData = chunks[i]
        const chunkChecksum = opts.calculateChecksum
          ? await this.chunker.calculateChecksum(chunkData)
          : ''

        const fileChunk: FileChunk = {
          fileId,
          chunkIndex: i,
          totalChunks,
          data: chunkData,
          checksum: chunkChecksum
        }

        // Retry logic
        let retries = 0
        let sent = false

        while (retries < opts.maxRetries && !sent) {
          try {
            await this.sendMessage(dataChannel, {
              type: 'file-chunk',
              data: fileChunk
            })
            sent = true
          } catch (error) {
            retries++
            if (retries >= opts.maxRetries) {
              throw new Error(`Failed to send chunk ${i} after ${opts.maxRetries} retries`)
            }
            await this.delay(opts.retryDelayMs)
          }
        }

        // Update progress
        const progress = Math.round(((i + 1) / totalChunks) * 100)
        await this.updateProgress(fileId, Status.TRANSFERRING, progress)
      }

      // 7️⃣ Send completion signal
      await this.sendMessage(dataChannel, {
        type: 'file-complete',
        data: { fileId, checksum: metadata.checksum }
      })

      // 8️⃣ Mark as completed
      metadata.status = Status.COMPLETED
      metadata.progress = 100
      await this.repository.update(metadata)
      await this.updateProgress(fileId, Status.COMPLETED, 100)

      // Cleanup
      this.activeTransfers.delete(fileId)
      await this.sessionManager.closeSession(session.sessionId)

      return metadata
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      await this.updateProgress(fileId, Status.FAILED, 0, errorMsg)

      this.emitError({
        code: 'SEND_FAILED',
        message: errorMsg,
        fileId
      })

      this.activeTransfers.delete(fileId)
      throw error
    }
  }

  /**
   * Receive file
   * Note: session phải là session đã được setup với data channel
   * (không được implement ở phase 1, cần React component để orchestrate)
   */
  async receiveFile(_sessionId: string, receivedMetadata: FileMetadata): Promise<Blob> {
    const fileId = receivedMetadata.id
    const abortController = new AbortController()
    this.activeTransfers.set(fileId, abortController)

    try {
      await this.repository.save(receivedMetadata)
      await this.updateProgress(fileId, Status.TRANSFERRING, 0)

      // Note: Trong implementation thực tế, data channel cần được setup
      // từ phía receiver accept session
      // Đây là placeholder cho refactor sau
      return new Promise((_resolve, reject) => {
        reject(new Error('receiveFile: Data channel setup cần được implement trong hooks'))
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      await this.updateProgress(fileId, Status.FAILED, 0, errorMsg)

      this.emitError({
        code: 'RECEIVE_FAILED',
        message: errorMsg,
        fileId
      })

      this.activeTransfers.delete(fileId)
      throw error
    }
  }

  /**
   * Cancel transfer
   */
  async cancelTransfer(fileId: string): Promise<void> {
    const abortController = this.activeTransfers.get(fileId)
    if (abortController) {
      abortController.abort()
      this.activeTransfers.delete(fileId)

      const metadata = await this.repository.findById(fileId)
      if (metadata) {
        metadata.status = Status.CANCELLED
        await this.repository.update(metadata)
      }
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    return this.repository.findById(fileId)
  }

  /**
   * Get conversation files
   */
  async getConversationFiles(conversationId: string): Promise<FileMetadata[]> {
    return this.repository.findByConversationId(conversationId)
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.repository.delete(fileId)
  }

  /**
   * Subscribe to progress
   */
  onProgress(callback: (progress: FileTransferProgress) => void): () => void {
    this.progressCallbacks.add(callback)
    return () => this.progressCallbacks.delete(callback)
  }

  /**
   * Subscribe to errors
   */
  onError(callback: (error: FileTransferError) => void): () => void {
    this.errorCallbacks.add(callback)
    return () => this.errorCallbacks.delete(callback)
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    // Cancel all active transfers
    for (const [fileId] of this.activeTransfers) {
      await this.cancelTransfer(fileId)
    }

    // Cleanup worker
    this.chunker.destroy()

    // Clear listeners
    this.progressCallbacks.clear()
    this.errorCallbacks.clear()
  }

  /* ================================
   * Private helpers
   * ================================ */

  private async updateProgress(
    fileId: string,
    status: FileTransferStatus,
    progress: number,
    error?: string
  ): Promise<void> {
    const metadata = await this.repository.findById(fileId)
    if (!metadata) return

    metadata.status = status
    metadata.progress = progress
    if (error) metadata.error = error

    await this.repository.update(metadata)

    // Emit progress event
    const progressData: FileTransferProgress = {
      fileId,
      fileName: metadata.name,
      bytesTransferred: Math.round((metadata.size * progress) / 100),
      totalBytes: metadata.size,
      percentage: progress,
      chunksCompleted: 0,
      totalChunks: 0,
      status
    }

    this.progressCallbacks.forEach((cb) => cb(progressData))
  }

  private emitError(error: FileTransferError): void {
    this.errorCallbacks.forEach((cb) => cb(error))
  }

  private sendMessage(
    dataChannel: RTCDataChannel,
    message: { type: string; data: unknown }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (dataChannel.readyState !== 'open') {
          reject(new Error('Data channel is not open'))
          return
        }

        dataChannel.send(JSON.stringify(message))
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  private generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
