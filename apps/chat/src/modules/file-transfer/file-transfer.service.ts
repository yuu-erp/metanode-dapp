import { createFileWithBuffer } from '@metanodejs/system-core'

interface FileMetadata {
  type: 'FILE_START'
  transferId: string
  fileName: string
  fileSize: number
  mimeType: string
  totalChunks: number
}

interface WorkerMessage {
  type: 'CHUNK_READY' | 'SEND_COMPLETE' | 'RECEIVED_COMPLETE'
  chunk?: ArrayBuffer
  progress?: number
  buffer?: ArrayBuffer
  fileName?: string
  fileType?: string
}

export class FileTransferService {
  private worker: Worker | null = null
  private activeTransfers: Map<
    string,
    {
      fileName: string
      fileType: string
      receivedChunks: ArrayBuffer[]
      totalChunks: number
    }
  > = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./workers/file-transfer.worker.ts', import.meta.url))
      this.worker.onmessage = this.handleWorkerMessage.bind(this)
    }
  }

  private handleWorkerMessage(_e: MessageEvent<WorkerMessage>) {
    // handled in promise context or general event bus if needed
    // For simple send, we might rely on the specific send flow listeners if we structured it that way
    // But since the worker is shared, we need a way to route callbacks.
    // For this MVP, we'll keep it simple and assume sequential operations or use Events.
  }

  /**
   * Sends a file over the provided DataChannel
   */
  async sendFile(file: File, dataChannel: RTCDataChannel): Promise<void> {
    const transferId = crypto.randomUUID()
    const totalChunks = Math.ceil(file.size / 16384) // 16KB default

    // 1. Send Metadata
    const metadata: FileMetadata = {
      type: 'FILE_START',
      transferId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      totalChunks
    }

    if (dataChannel.readyState !== 'open') {
      throw new Error('DataChannel is not open')
    }

    dataChannel.send(JSON.stringify(metadata))
    console.log('[FileTransferService] Sent metadata:', metadata)

    // 2. Delegate chunking to Worker
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      // One-off handler for this transfer's worker messages
      const handler = (e: MessageEvent<WorkerMessage>) => {
        const { type, chunk, progress: _progress } = e.data

        switch (type) {
          case 'CHUNK_READY':
            if (chunk && dataChannel.readyState === 'open') {
              // Simple backpressure check
              if (dataChannel.bufferedAmount > 16 * 1024 * 100) {
                // > 1.6MB buffered
                // In a real app we would wait for bufferedAmountLow
                // For now, risk it or rely on small files
              }
              dataChannel.send(chunk)
            }
            break
          case 'SEND_COMPLETE':
            console.log('[FileTransferService] File send complete')
            this.worker?.removeEventListener('message', handler)
            resolve()
            break
        }
      }

      this.worker.addEventListener('message', handler)
      this.worker.postMessage({ type: 'START_SEND', file })
    })
  }

  /**
   * Handles incoming DataChannel messages (String metadata or Binary chunks)
   */
  async handleIncomingData(data: string | ArrayBuffer): Promise<string | undefined> {
    if (typeof data === 'string') {
      try {
        const msg = JSON.parse(data)
        if (msg.type === 'FILE_START') {
          const meta = msg as FileMetadata
          console.log('[FileTransfer] Receiving file:', meta.fileName)
          this.activeTransfers.set(meta.transferId, {
            // Simplify: assume single transfer for now or use ID mapping
            fileName: meta.fileName,
            fileType: meta.mimeType,
            receivedChunks: [],
            totalChunks: meta.totalChunks
          })
          // Store "current" transfer ID if we want to support mixed binary/text later
          // For now assuming ordered delivery on channel
          this.currentTransferId = meta.transferId
        }
      } catch (e) {
        /* Not JSON, ignore */
      }
      return
    }

    // Handle Binary Chunk
    if (this.currentTransferId && this.activeTransfers.has(this.currentTransferId)) {
      const transfer = this.activeTransfers.get(this.currentTransferId)!
      transfer.receivedChunks.push(data)

      // Check completion (Naive check by count or size)
      // In production, we should track total bytes
      const currentSize = transfer.receivedChunks.reduce((acc, c) => acc + c.byteLength, 0)

      // We don't have exact size match logic in this snippet without passing expected size to this context
      // But let's check against totalChunks if possible, or just wait?
      // Worker logic used "FINISH_RECEIVE" explicit signal usually.
      // Here we are rebuilding manually.

      if (transfer.receivedChunks.length >= transfer.totalChunks) {
        console.log('[FileTransfer] Reassembling file...')
        // Reassemble
        const bigBuffer = new Uint8Array(currentSize)
        let offset = 0
        for (const c of transfer.receivedChunks) {
          bigBuffer.set(new Uint8Array(c), offset)
          offset += c.byteLength
        }

        const savedPath = await this.saveReceivedFile(transfer.fileName, bigBuffer.buffer)
        this.activeTransfers.delete(this.currentTransferId)
        this.currentTransferId = undefined
        return savedPath
      }
    }
  }

  private currentTransferId?: string

  /**
   * Saves a received file to the system's local storage and returns the local path.
   * @param fileName Original name of the file
   * @param buffer ArrayBuffer containing the file data
   * @returns Local path where the file was saved
   */
  async saveReceivedFile(fileName: string, buffer: ArrayBuffer): Promise<string> {
    try {
      const dotIndex = fileName.lastIndexOf('.')
      const name = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName
      const ext = dotIndex !== -1 ? fileName.substring(dotIndex + 1) : ''

      // Convert ArrayBuffer to a plain number array for the system bridge
      const uint8Array = new Uint8Array(buffer)
      const dataArray = Array.from(uint8Array)

      console.log(`[FileTransferService] Saving file: ${fileName} (${uint8Array.length} bytes)`)

      const result = await createFileWithBuffer(name, 'message', ext, dataArray)

      console.log(`[FileTransferService] File saved successfully at: ${result.path} `)
      return result.path
    } catch (error) {
      console.error('[FileTransferService] Failed to save file:', error)
      throw error
    }
  }
}
