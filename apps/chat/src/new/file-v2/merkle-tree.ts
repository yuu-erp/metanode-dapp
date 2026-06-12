import { sendCommand } from '@metanodejs/system-core'

const chunkSize = 1024 * 250
const EMPTY_HASH = '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  if (cleanHex.length === 0) return new Uint8Array(0)

  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16)
  }
  return bytes
}

const nextPowerOfTwo = (n: number): number => {
  if (n <= 0) return 1
  n--
  n |= n >> 1
  n |= n >> 2
  n |= n >> 4
  n |= n >> 8
  n |= n >> 16
  return n + 1
}

async function hash(input: Uint8Array) {
  if (window.fiaiSDK) return (await sendCommand('hashFile', { data: input })).hash

  const buffer = Array.from(input)
  const rs = await sendCommand('createHashWithBuffer', { buffer })
  return rs.hash
}

export async function buildTree(file: Blob) {
  const totalChunk = Math.ceil(file.size / chunkSize)
  const chunkCapacity = nextPowerOfTwo(totalChunk)

  const buffer = await file.arrayBuffer()
  const binary = new Uint8Array(buffer)

  const chunks = Array.from({ length: totalChunk }, (_, i) => {
    const start = i * chunkSize
    const end = start + chunkSize
    return binary.slice(start, end)
  })

  // leaf level
  let level = await Promise.all(
    Array.from({ length: chunkCapacity }, (_, i) => (i < totalChunk ? hash(chunks[i]) : EMPTY_HASH))
  )

  const levels: string[][] = [level]

  // build parent levels
  while (level.length > 1) {
    const nextLevel: string[] = []

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]!
      const right = level[i + 1] ?? EMPTY_HASH
      const combined = new Uint8Array(64)
      combined.set(hexToBytes(left), 0)
      combined.set(hexToBytes(right), 32)
      const hashed = await hash(combined)
      nextLevel.push(hashed)
    }

    levels.push(nextLevel)
    level = nextLevel
  }

  const root = level[0]!

  return {
    root,
    levels,
    leaves: levels[0],
    totalChunk,
    chunks
  }
}

export const getProof = (levels: string[][], index: number) => {
  const proof: string[] = []
  let idx = index

  // Chỉ cần traverse levels đã build để lấy proof (không rebuild)
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
