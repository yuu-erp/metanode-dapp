import { DOWNLOAD_SERVER_1, DOWNLOAD_SERVER_2 } from '../configs'
import { WorkerQueue } from '../worker-queue'

export interface WtChunkRequest {
  id: string
  command: 'download_chunk'
  payload: {
    download_key: string
    chunk_index: number
    signature: string
  }
}

export interface WtChunkResponseOk {
  ok: true
  id: string
  chunkIndex?: number
  command?: string
  data: ArrayBuffer
}

export interface WtChunkResponseErr {
  ok: false
  error: string
}

export type WtChunkResponse = WtChunkResponseOk | WtChunkResponseErr

/**
 * Encode một object thành frame nhị phân:
 * [4 byte BE uint32 length][JSON UTF-8 bytes]
 */
function encodeFrame(obj: object): Uint8Array {
  const json = JSON.stringify(obj)
  const jsonBytes = new TextEncoder().encode(json)
  const frame = new Uint8Array(4 + jsonBytes.length)
  new DataView(frame.buffer).setUint32(0, jsonBytes.length, false) // big-endian
  frame.set(jsonBytes, 4)
  return frame
}

/**
 * Đọc response frame từ ReadableStream của WebTransport.
 * - Thành công: trả về sha256 (hex) và raw ArrayBuffer
 * - Lỗi:       trả về error message string
 */
async function readResponseFrame(
  reader: ReadableStreamDefaultReader<Uint8Array>
): Promise<WtChunkResponse> {
  const chunks: Uint8Array[] = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      total += value.length
    }
  }

  if (total < 6) return { ok: false, error: 'Response quá ngắn (< 6 bytes)' }

  // Ghép tất cả chunks lại
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    bytes.set(c, offset)
    offset += c.length
  }

  const payloadLen = new DataView(bytes.buffer).getUint32(0, false)
  const payload = bytes.slice(4, 4 + payloadLen)

  if (payload.length < 2) return { ok: false, error: 'Payload quá ngắn để parse JSON header' }

  const jsonLen = new DataView(payload.buffer, payload.byteOffset).getUint16(0, false)
  if (payload.length < 2 + jsonLen) return { ok: false, error: 'JSON header bị cắt cụt' }

  const jsonBytes = payload.slice(2, 2 + jsonLen)
  const jsonStr = new TextDecoder().decode(jsonBytes)

  let header: any
  try {
    header = JSON.parse(jsonStr)
  } catch (e) {
    return { ok: false, error: 'Lỗi parse JSON header' }
  }

  if (header.status === 'error') {
    return { ok: false, error: header.message || 'Unknown server error' }
  }

  // ArrayBuffer cần copy vì slice trả về view trên cùng buffer
  const rawData = payload
    .slice(2 + jsonLen)
    .buffer.slice(payload.byteOffset + 2 + jsonLen, payload.byteOffset + payloadLen)

  return { ok: true, id: header.id, command: header.command, data: rawData }
}

async function fetchChunkOnStream(
  transport: WebTransport,
  downloadKey: string,
  chunkIndex: number,
  signature: string
): Promise<WtChunkResponse> {
  const stream = await transport.createBidirectionalStream()
  const writer = stream.writable.getWriter()
  const reader = stream.readable.getReader()

  try {
    const request: WtChunkRequest = {
      id: crypto.randomUUID(),
      command: 'download_chunk',
      payload: { download_key: downloadKey, chunk_index: chunkIndex, signature }
    }

    const frame = encodeFrame(request)
    await writer.write(frame)
    await writer.close()
    writer.releaseLock()

    const result = await readResponseFrame(reader)
    return result
  } finally {
    reader.releaseLock()
  }
}

export async function downloadFileByWebTransport(
  fileKey: string,
  fileInfo: BCInfo,
  rawDownloadKey: string,
  downloadKeySign: string,
  onProgress?: (v: number) => void
) {
  try {
    console.log('fileKey', fileKey)
    const totalChunks = Number(fileInfo.totalChunks)
    if (totalChunks === 0) throw new Error('File rỗng hoặc không tồn tại')

    const chunksData: ArrayBuffer[] = []

    // Mở connection 1 lần duy nhất cho mỗi server
    const t1 = new WebTransport(`${DOWNLOAD_SERVER_1}/quic`)
    const t2 = new WebTransport(`${DOWNLOAD_SERVER_2}/quic`)
    await Promise.all([t1.ready, t2.ready])

    try {
      const CONCURRENCY_LIMIT = 20
      const queue = new WorkerQueue(CONCURRENCY_LIMIT)
      let completed = 0

      const tasks: Promise<void>[] = []

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const transport = chunkIndex % 2 === 0 ? t1 : t2

        tasks.push(
          queue.enqueue(async () => {
            let lastError: any
            const MAX_RETRIES = 3

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
              try {
                const result: any = await fetchChunkOnStream(
                  transport,
                  rawDownloadKey,
                  chunkIndex,
                  downloadKeySign
                )
                if (!result.ok) {
                  throw new Error(`Server báo lỗi: ${result.error}`)
                }

                chunksData[chunkIndex] = result.data

                completed++

                onProgress?.(+(completed / totalChunks).toFixed(2))

                return
              } catch (err: any) {
                lastError = err

                console.warn(`[Retry ${attempt}/${MAX_RETRIES}] Lỗi tải chunk ${chunkIndex}:`, err)

                if (attempt < MAX_RETRIES) {
                  await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
                }
              }
            }

            throw new Error(
              `Lỗi tải chunk ${chunkIndex} sau ${MAX_RETRIES} lần thử: ${
                lastError?.message || String(lastError)
              }`
            )
          })
        )
      }

      await Promise.all(tasks)

      // chunksData lúc này đã đúng thứ tự:
      // chunksData[0], chunksData[1], ...
    } finally {
      t1.close()
      t2.close()
    }

    const blob = new Blob(chunksData as BlobPart[], {
      type: fileInfo.ext
    })

    return blob
  } catch (error) {
    console.error(error)
    throw error
  }
}
