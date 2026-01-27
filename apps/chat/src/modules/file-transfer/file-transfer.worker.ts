/**
 * file-transfer.worker.ts
 * =======================
 * Web Worker cho file processing
 * Offload CPU-intensive tasks:
 * - File splitting
 * - Checksum calculation
 * - Chunk assembly
 */

/**
 * Message types từ main thread -> worker
 */
export type FileTransferWorkerMessage =
  | {
      id: string
      type: 'split'
      payload: {
        arrayBuffer: ArrayBuffer
        chunkSize: number
      }
    }
  | {
      id: string
      type: 'combine'
      payload: {
        chunks: Uint8Array[]
      }
    }
  | {
      id: string
      type: 'calculateChecksum'
      payload: {
        data: ArrayBuffer
      }
    }
  | {
      id: string
      type: 'validateChecksum'
      payload: {
        data: ArrayBuffer
        expectedChecksum: string
      }
    }

/**
 * Message types từ worker -> main thread
 */
export type FileTransferWorkerResponse =
  | {
      id: string
      type: 'split'
      result: Uint8Array[]
    }
  | {
      id: string
      type: 'combine'
      result: ArrayBuffer
    }
  | {
      id: string
      type: 'calculateChecksum'
      result: string
    }
  | {
      id: string
      type: 'validateChecksum'
      result: boolean
    }
  | {
      id: string
      type: 'error'
      error: string
    }

/**
 * Worker implementation
 */
class FileTransferWorker {
  private handleMessage = (event: MessageEvent<FileTransferWorkerMessage>) => {
    const { id, type, payload } = event.data

    try {
      switch (type) {
        case 'split':
          this.split(id, payload.arrayBuffer, payload.chunkSize)
          break

        case 'combine':
          this.combine(id, payload.chunks)
          break

        case 'calculateChecksum':
          this.calculateChecksum(id, payload.data)
          break

        case 'validateChecksum':
          this.validateChecksum(id, payload.data, payload.expectedChecksum)
          break

        default:
          this.sendError(id, `Unknown message type: ${type}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      this.sendError(id, errorMsg)
    }
  }

  /**
   * Split file into chunks
   */
  private split(id: string, arrayBuffer: ArrayBuffer, chunkSize: number): void {
    const chunks: Uint8Array[] = []

    for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
      const size = Math.min(chunkSize, arrayBuffer.byteLength - i)
      const chunk = new Uint8Array(arrayBuffer, i, size)
      chunks.push(new Uint8Array(chunk)) // Copy to avoid reference issues
    }

    this.postMessage({
      id,
      type: 'split',
      result: chunks
    } as FileTransferWorkerResponse)
  }

  /**
   * Combine chunks into single buffer
   */
  private combine(id: string, chunks: Uint8Array[]): void {
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
    const combined = new Uint8Array(totalSize)

    let offset = 0
    for (const chunk of chunks) {
      combined.set(chunk, offset)
      offset += chunk.byteLength
    }

    this.postMessage(
      {
        id,
        type: 'combine',
        result: combined.buffer
      } as FileTransferWorkerResponse,
      [combined.buffer]
    )
  }

  /**
   * Calculate SHA-256 checksum
   */
  private async calculateChecksum(id: string, data: ArrayBuffer): Promise<void> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const checksum = this.bufferToHex(hashBuffer)

    this.postMessage({
      id,
      type: 'calculateChecksum',
      result: checksum
    } as FileTransferWorkerResponse)
  }

  /**
   * Validate checksum
   */
  private async validateChecksum(
    id: string,
    data: ArrayBuffer,
    expectedChecksum: string
  ): Promise<void> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const actualChecksum = this.bufferToHex(hashBuffer)
    const isValid = actualChecksum === expectedChecksum

    this.postMessage({
      id,
      type: 'validateChecksum',
      result: isValid
    } as FileTransferWorkerResponse)
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
   * Send response to main thread
   */
  private postMessage(message: FileTransferWorkerResponse, transfer?: Transferable[]): void {
    if (transfer && transfer.length > 0) {
      ;(self as any).postMessage(message, transfer)
    } else {
      ;(self as any).postMessage(message)
    }
  }

  /**
   * Send error to main thread
   */
  private sendError(id: string, error: string): void {
    this.postMessage({
      id,
      type: 'error',
      error
    } as FileTransferWorkerResponse)
  }

  /**
   * Initialize worker
   */
  init(): void {
    self.addEventListener('message', this.handleMessage)
  }
}

// Khởi tạo worker
const worker = new FileTransferWorker()
worker.init()
