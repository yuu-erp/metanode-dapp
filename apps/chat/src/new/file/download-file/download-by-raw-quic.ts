import { methods } from '@/clients'
import { sendCommand } from '@metanodejs/system-core'
import { WorkerQueue } from '../worker-queue'

function toConnectionConfig(input: string) {
  const [ip, port] = input.split(':')
  return { ip, port: +port, alpn: 'file-storage-v1' }
}

export async function getChunk(
  fileId: string,
  serverAdd: string,
  downloadKey: string,
  chunkIdx: number,
  signature: string
) {
  const payload = {
    command: 'DownloadChunkRequest',
    payload: {
      file_key: fileId,
      download_key: downloadKey,
      chunk_index: chunkIdx,
      signature
    }
  }

  const payloadString = JSON.stringify(payload) + '\n'

  const response = await sendCommand('sendQuicMessage', {
    ...toConnectionConfig(serverAdd),
    payload: payloadString
  })

  let data

  try {
    data = JSON.parse(response)
  } catch {
    data = response
  }

  if (data?.status !== 'SUCCESS') {
    throw new Error(data?.message || 'Unknown error')
  }

  const base64 = data?.chunk_data_base64

  if (!base64) {
    throw new Error('No chunk data in response')
  }

  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes
}

async function connectQuic() {
  const addresses = await methods.file.getRustServerAddresses(undefined)

  await sendCommand('connectQuicServer', toConnectionConfig(addresses[0])).catch((err) => {
    console.error('connect 0 failed', {
      err,
      cfg: toConnectionConfig(addresses[0])
    })
  })

  await sendCommand('connectQuicServer', toConnectionConfig(addresses[1])).catch((err) => {
    console.error('connect 1 failed', {
      err,
      cfg: toConnectionConfig(addresses[1])
    })
  })

  return addresses
}

async function disconnectQuic(addresses: string[]) {
  return Promise.all(
    addresses.map((add) => sendCommand('disconnectQuicServer', toConnectionConfig(add)))
  )
}

export async function downByRawQuic(
  fileKey: string,
  fileInfo: BCInfo,
  rawDownloadKey: string,
  downloadKeySign: string,
  onProgress?: (v: number) => void
) {
  const addresses = await connectQuic()
  const [add1, add2] = addresses

  try {
    const totalChunks = fileInfo.totalChunks

    const chunksData = new Array<ArrayBuffer>(totalChunks)

    const queue = new WorkerQueue(20)

    let completed = 0

    const tasks: Promise<void>[] = []

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      tasks.push(
        queue.enqueue(async () => {
          const server = chunkIndex % 2 === 0 ? add1 : add2

          let lastError: unknown

          const MAX_RETRIES = 3

          for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
              const result = await getChunk(
                fileKey,
                server,
                rawDownloadKey,
                chunkIndex,
                downloadKeySign
              )

              chunksData[chunkIndex] = result.buffer.slice(
                result.byteOffset,
                result.byteOffset + result.byteLength
              )

              completed++

              onProgress?.(+(completed / totalChunks).toFixed(2))

              return
            } catch (error: any) {
              lastError = error

              const message = error?.message?.toLowerCase?.() ?? String(error)

              if (message.includes('to store chunk on disk')) {
                throw error
              }

              if (attempt < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
              }
            }
          }

          throw new Error(
            `Lỗi tải chunk ${chunkIndex} sau ${MAX_RETRIES} lần thử: ${
              lastError instanceof Error ? lastError.message : String(lastError)
            }`
          )
        })
      )
    }

    await Promise.all(tasks)

    return new Blob(chunksData, {
      type: fileInfo.ext
    })
  } catch (error) {
    console.error('[downByRawQuic] error', error)
    throw error
  } finally {
    await disconnectQuic(addresses)
  }
}
