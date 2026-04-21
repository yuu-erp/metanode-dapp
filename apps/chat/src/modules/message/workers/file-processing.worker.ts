import { keccak256, solidityPacked } from 'ethers'

interface WorkerMessage {
  type: 'PROCESS_FILE'
  file: File
  id: string
}

interface WorkerResponse {
  type: 'PROCESS_COMPLETE' | 'PROCESS_ERROR'
  id: string
  payload?: {
    chunkData: string[]
    chunkHash: string[]
    lastChunkHash: string
  }
  error?: string
}

const CHUNK_SIZE = 1024

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, file, id } = e.data

  if (type === 'PROCESS_FILE') {
    try {
      const { chunkData, chunkHash, lastChunkHash } = await processFile(file)
      self.postMessage({
        type: 'PROCESS_COMPLETE',
        id,
        payload: {
          chunkData,
          chunkHash,
          lastChunkHash
        }
      } as WorkerResponse)
    } catch (error) {
      self.postMessage({
        type: 'PROCESS_ERROR',
        id,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as WorkerResponse)
    }
  }
}

async function processFile(file: File) {
  const chunkData: string[] = []
  const chunkHash: string[] = []
  let lastChunkHash = '0x'
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const blob = file.slice(start, end)
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const hash = computeChunkHash(lastChunkHash, buffer)
    lastChunkHash = hash

    const chunkDataContent = Array.from(buffer)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')

    chunkData.push(chunkDataContent)
    chunkHash.push(hash)
  }

  return { chunkData, chunkHash, lastChunkHash }
}

function computeChunkHash(lastChunkHash: string, chunkData: Uint8Array): string {
  const emptyBytes32 = '0x'.padEnd(66, '0')
  let encodedData: string
  if (!lastChunkHash || lastChunkHash === '0x') {
    encodedData = solidityPacked(['bytes32', 'bytes'], [emptyBytes32, chunkData])
  } else {
    encodedData = solidityPacked(['bytes32', 'bytes'], [lastChunkHash, chunkData])
  }
  return keccak256(encodedData)
}
