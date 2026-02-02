/**
 * File Transfer Web Worker
 *
 * Responsibilities:
 * - Read files in chunks (16KB by default for RTCDataChannel compatibility).
 * - Manage sending queue and flow control signals.
 * - Reconstruct received chunks into a final Blob.
 *
 * This avoids blocking the main thread during large file operations.
 */

const CHUNK_SIZE = 16384 // 16KB

interface WorkerMessage {
  type: 'START_SEND' | 'NEXT_CHUNK' | 'RECEIVE_CHUNK' | 'FINISH_RECEIVE'
  file?: File
  chunk?: ArrayBuffer
  fileName?: string
  fileType?: string
}

let sendingFile: File | null = null
let offset = 0

// For receiving
let receivedChunks: ArrayBuffer[] = []

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, file, chunk } = e.data

  switch (type) {
    case 'START_SEND':
      if (file) {
        sendingFile = file
        offset = 0
        sendNextChunk()
      }
      break

    case 'NEXT_CHUNK':
      sendNextChunk()
      break

    case 'RECEIVE_CHUNK':
      if (chunk) {
        receivedChunks.push(chunk)
      }
      break

    case 'FINISH_RECEIVE':
      const { fileName, fileType } = e.data
      const combinedBuffer = new Uint8Array(
        receivedChunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
      )
      let receiveOffset = 0
      for (const chunk of receivedChunks) {
        combinedBuffer.set(new Uint8Array(chunk), receiveOffset)
        receiveOffset += chunk.byteLength
      }

      ;(self as any).postMessage(
        {
          type: 'RECEIVED_COMPLETE',
          buffer: combinedBuffer.buffer,
          fileName,
          fileType
        },
        [combinedBuffer.buffer]
      )

      receivedChunks = [] // Reset
      break
  }
}

async function sendNextChunk() {
  if (!sendingFile) return

  if (offset >= sendingFile.size) {
    ;(self as any).postMessage({ type: 'SEND_COMPLETE' })
    sendingFile = null
    offset = 0
    return
  }

  const slice = sendingFile.slice(offset, offset + CHUNK_SIZE)
  const arrayBuffer = await slice.arrayBuffer()

  offset += CHUNK_SIZE
  const progress = Math.min(100, Math.round((offset / sendingFile.size) * 100))

  ;(self as any).postMessage(
    {
      type: 'CHUNK_READY',
      chunk: arrayBuffer,
      progress
    },
    [arrayBuffer]
  ) // Transfer the buffer
}
