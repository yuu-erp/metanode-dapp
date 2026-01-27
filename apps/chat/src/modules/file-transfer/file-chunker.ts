/**
 * file-chunker.ts
 * ===============
 * Utility cho chunking & checksum files
 * Hỗ trợ Web Worker để optimize performance
 */

import type { FileChunkerPort } from './file-transfer.type'
import type { FileTransferWorkerMessage, FileTransferWorkerResponse } from './file-transfer.worker'

const DEFAULT_CHUNK_SIZE = 16 * 1024 // 16KB

/**
 * FileChunker
 * Responsible for:
 * - Splitting file thành chunks (via worker)
 * - Combining chunks lại thành file (via worker)
 * - Calculating checksums (via worker)
 * - Fallback to main thread nếu worker không available
 */
export class FileChunker implements FileChunkerPort {
  private worker: Worker | null = null
  private messageId = 0
  private pendingRequests: Map<
    string,
    { resolve: (value: any) => void; reject: (error: Error) => void }
  > = new Map()

  constructor(useWorker = true) {
    if (useWorker && typeof Worker !== 'undefined') {
      try {
        // Tạo worker từ file
        this.worker = new Worker(new URL('./file-transfer.worker.ts', import.meta.url), {
          type: 'module'
        })

        // Listen cho messages từ worker
        this.worker.addEventListener('message', this.handleWorkerMessage)
        this.worker.addEventListener('error', this.handleWorkerError)
      } catch (error) {
        console.warn('Failed to create Web Worker, falling back to main thread:', error)
        this.worker = null
      }
    }
  }

  /**
   * Handle message từ worker
   */
  private handleWorkerMessage = (event: MessageEvent<FileTransferWorkerResponse>) => {
    const { id, type } = event.data

    if (type === 'error') {
      const request = this.pendingRequests.get(id)
      if (request) {
        request.reject(new Error((event.data as any).error))
        this.pendingRequests.delete(id)
      }
      return
    }

    const request = this.pendingRequests.get(id)
    if (request) {
      request.resolve((event.data as any).result)
      this.pendingRequests.delete(id)
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError = (error: ErrorEvent) => {
    console.error('Web Worker error:', error)
    // Reject all pending requests
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error(`Worker error: ${error.message}`))
    })
    this.pendingRequests.clear()
  }

  /**
   * Send message tới worker và wait for response
   */
  private async sendToWorker<T = any>(message: FileTransferWorkerMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(message.id, { resolve, reject })

      try {
        // Send message với transferable objects if needed
        if (message.type === 'combine' && 'payload' in message) {
          const chunks = (message.payload as any).chunks
          const buffers = chunks.map((chunk: Uint8Array) => chunk.buffer)
          this.worker!.postMessage(message, buffers)
        } else {
          this.worker!.postMessage(message)
        }

        // Timeout nếu worker không respond trong 30 seconds
        const timeoutId = setTimeout(() => {
          this.pendingRequests.delete(message.id)
          reject(new Error('Worker timeout'))
        }, 30000)

        // Clear timeout khi nhận response
        const originalResolve = this.pendingRequests.get(message.id)?.resolve
        if (originalResolve) {
          this.pendingRequests.set(message.id, {
            resolve: (value) => {
              clearTimeout(timeoutId)
              originalResolve(value)
            },
            reject
          })
        }
      } catch (error) {
        this.pendingRequests.delete(message.id)
        reject(error)
      }
    })
  }

  /**
   * Split file thành array of Uint8Array chunks
   * Sử dụng worker nếu available, fallback to main thread
   */
  async split(file: File, chunkSize = DEFAULT_CHUNK_SIZE): Promise<Uint8Array[]> {
    // Nếu file nhỏ, dùng main thread (overhead của worker không đáng)
    if (file.size < 1024 * 1024) {
      // < 1MB
      return this.splitSync(file, chunkSize)
    }

    // Nếu có worker, delegate tới worker
    if (this.worker) {
      try {
        const buffer = await file.arrayBuffer()
        const messageId = `split-${++this.messageId}`

        return await this.sendToWorker<Uint8Array[]>({
          id: messageId,
          type: 'split',
          payload: {
            arrayBuffer: buffer,
            chunkSize
          }
        })
      } catch (error) {
        console.warn('Worker split failed, falling back to main thread:', error)
        return this.splitSync(file, chunkSize)
      }
    }

    return this.splitSync(file, chunkSize)
  }

  /**
   * Split synchronously (fallback)
   */
  private async splitSync(file: File, chunkSize: number): Promise<Uint8Array[]> {
    const buffer = await file.arrayBuffer()
    const chunks: Uint8Array[] = []

    for (let i = 0; i < buffer.byteLength; i += chunkSize) {
      const chunk = new Uint8Array(buffer, i, Math.min(chunkSize, buffer.byteLength - i))
      chunks.push(new Uint8Array(chunk))
    }

    return chunks
  }

  /**
   * Combine chunks thành single Blob
   * Sử dụng worker nếu available
   */
  async combine(chunks: Uint8Array[]): Promise<Blob> {
    // Small combine, do it sync
    if (chunks.length < 10) {
      return this.combineSync(chunks)
    }

    // Use worker for large combines
    if (this.worker) {
      try {
        const messageId = `combine-${++this.messageId}`
        const buffer = await this.sendToWorker<ArrayBuffer>({
          id: messageId,
          type: 'combine',
          payload: { chunks }
        })

        return new Blob([buffer], { type: 'application/octet-stream' })
      } catch (error) {
        console.warn('Worker combine failed, falling back to main thread:', error)
        return this.combineSync(chunks)
      }
    }

    return this.combineSync(chunks)
  }

  /**
   * Combine synchronously (fallback)
   */
  private combineSync(chunks: Uint8Array[]): Blob {
    const parts: BlobPart[] = chunks as BlobPart[]
    return new Blob(parts, { type: 'application/octet-stream' })
  }

  /**
   * Calculate SHA-256 checksum của file hoặc data
   * Sử dụng worker nếu available
   */
  async calculateChecksum(data: Uint8Array | File): Promise<string> {
    if (this.worker) {
      try {
        let arrayBuffer: ArrayBuffer

        if (data instanceof File) {
          arrayBuffer = await data.arrayBuffer()
        } else {
          const buffer = data.buffer as ArrayBuffer
          arrayBuffer = buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
        }

        const messageId = `checksum-${++this.messageId}`
        return await this.sendToWorker<string>({
          id: messageId,
          type: 'calculateChecksum',
          payload: { data: arrayBuffer }
        })
      } catch (error) {
        console.warn('Worker checksum calculation failed, falling back to main thread:', error)
        return this.calculateChecksumSync(data)
      }
    }

    return this.calculateChecksumSync(data)
  }

  /**
   * Calculate checksum synchronously (fallback)
   */
  private async calculateChecksumSync(data: Uint8Array | File): Promise<string> {
    let arrayBuffer: ArrayBuffer

    if (data instanceof File) {
      arrayBuffer = await data.arrayBuffer()
    } else {
      const buffer = data.buffer as ArrayBuffer
      arrayBuffer = buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    return this.bufferToHex(hashBuffer)
  }

  /**
   * Validate checksum của chunk
   * Sử dụng worker nếu available
   */
  async validateChecksum(data: Uint8Array, expectedChecksum: string): Promise<boolean> {
    if (this.worker) {
      try {
        const buffer = data.buffer as ArrayBuffer
        const arrayBuffer = buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)

        const messageId = `validate-${++this.messageId}`
        return await this.sendToWorker<boolean>({
          id: messageId,
          type: 'validateChecksum',
          payload: {
            data: arrayBuffer,
            expectedChecksum
          }
        })
      } catch (error) {
        console.warn('Worker validation failed, falling back to main thread:', error)
        return this.validateChecksumSync(data, expectedChecksum)
      }
    }

    return this.validateChecksumSync(data, expectedChecksum)
  }

  /**
   * Validate checksum synchronously (fallback)
   */
  private async validateChecksumSync(data: Uint8Array, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.calculateChecksumSync(data)
    return actualChecksum === expectedChecksum
  }

  /**
   * Helper: Convert ArrayBuffer to hex string
   */
  private bufferToHex(buffer: ArrayBuffer): string {
    const view = new Uint8Array(buffer)
    return Array.from(view)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * Cleanup worker
   */
  destroy(): void {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleWorkerMessage)
      this.worker.removeEventListener('error', this.handleWorkerError)
      this.worker.terminate()
      this.worker = null
    }
  }
}
