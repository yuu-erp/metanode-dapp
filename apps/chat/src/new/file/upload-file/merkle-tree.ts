import { sendCommand } from '@metanodejs/system-core'
import { WorkerQueue } from '../worker-queue'

const chunkSize = 1024 * 250

const EMPTY_HASH = '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

const HASH_CONCURRENCY = 20

const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex

  if (cleanHex.length === 0) {
    return new Uint8Array(0)
  }

  const bytes = new Uint8Array(cleanHex.length / 2)

  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16)
  }

  return bytes
}

const nextPowerOfTwo = (n: number): number => {
  if (n <= 0) {
    return 1
  }

  n--

  n |= n >> 1
  n |= n >> 2
  n |= n >> 4
  n |= n >> 8
  n |= n >> 16

  return n + 1
}

async function hash(input: Uint8Array) {
  if (window.fiaiSDK) {
    return (await sendCommand('hashFile', { data: input })).hash
  }

  const buffer = Array.from(input)

  const rs = await sendCommand('createHashWithBuffer', {
    buffer
  })

  return rs.hash
}

export const calculateHashWork = (chunkCount: number) => {
  const capacity = nextPowerOfTwo(chunkCount)

  return capacity * 2 - 1
}

export async function buildTree(file: Blob, onHashComplete?: () => void) {
  const totalChunk = Math.ceil(file.size / chunkSize)

  const chunkCapacity = nextPowerOfTwo(totalChunk)

  const buffer = await file.arrayBuffer()

  const binary = new Uint8Array(buffer)

  const chunks = Array.from({ length: totalChunk }, (_, i) => {
    const start = i * chunkSize
    const end = start + chunkSize

    return binary.slice(start, end)
  })

  const queue = new WorkerQueue(HASH_CONCURRENCY)

  const leaves = new Array<string>(chunkCapacity)

  const leafTasks: Promise<void>[] = []

  for (let i = 0; i < chunkCapacity; i++) {
    if (i >= totalChunk) {
      leaves[i] = EMPTY_HASH

      onHashComplete?.()

      continue
    }

    leafTasks.push(
      queue.enqueue(async () => {
        leaves[i] = await hash(chunks[i]!)

        onHashComplete?.()
      })
    )
  }

  await Promise.all(leafTasks)

  let level = leaves

  const levels: string[][] = [level]

  while (level.length > 1) {
    const nextLevel = new Array<string>(Math.ceil(level.length / 2))

    const parentTasks: Promise<void>[] = []

    for (let i = 0; i < level.length; i += 2) {
      const outputIndex = i / 2

      parentTasks.push(
        queue.enqueue(async () => {
          const left = level[i]!
          const right = level[i + 1] ?? EMPTY_HASH

          const combined = new Uint8Array(64)

          combined.set(hexToBytes(left), 0)
          combined.set(hexToBytes(right), 32)

          nextLevel[outputIndex] = await hash(combined)

          onHashComplete?.()
        })
      )
    }

    await Promise.all(parentTasks)

    levels.push(nextLevel)

    level = nextLevel
  }

  return {
    root: level[0]!,
    levels,
    leaves: levels[0],
    totalChunk,
    chunks
  }
}

export const getProof = (levels: string[][], index: number) => {
  const proof: string[] = []

  let idx = index

  for (let levelIdx = 0; levelIdx < levels.length - 1; levelIdx++) {
    const level = levels[levelIdx]!

    const isLeft = idx % 2 === 0

    const siblingIdx = isLeft ? idx + 1 : idx - 1

    const siblingHash = siblingIdx < level.length ? level[siblingIdx]! : EMPTY_HASH

    proof.push(siblingHash)

    idx = Math.floor(idx / 2)
  }

  return proof
}
