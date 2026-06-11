import { container } from '@/container'
import type { Account } from '@/modules/account'
import { normalizePath } from '@/shared/lib'
import type { FileItem } from '@/stores/file.store'
import { useUiStore } from '@/stores/ui.store'
import { sendCommand } from '@metanodejs/system-core'
import { hexlify, solidityPacked } from 'ethers'
import { CHUNK_SIZE } from './configs'

export class FileHandler {
  //clients

  constructor() {}

  async uploadFile(item: FileItem, options: any = {}) {
    try {
      const { onProgress, owner = '', hiddenAddress = '', limit = 50, clientId = '' } = options
      const { meta, file } = item
      if (!file) throw new Error('[uploadFile] Invalid file')

      const onCancel = () => {
        const { cancelIds } = useUiStore.getState()

        if (cancelIds.includes(clientId)) throw new Error('Cancel file')
      }

      const payload = window.fiaiSDK ? { file: item.file } : { path: normalizePath(meta.path) }
      onProgress?.(0)

      const { hash } = await sendCommand('createHashFromFile', payload)
      onCancel()
      const fileName = `${meta.fileName}_${Date.now()}`

      const totalChunks = Math.ceil(meta.size / CHUNK_SIZE)
      onProgress?.(10)
      //upload meta
      await container.fileCotract.pushFileInfo({
        from: hiddenAddress,
        inputData: {
          info: {
            contentDisposition: '',
            contentID: '',
            contentLen: meta.size,
            expireTime: Math.floor(Date.now() / 1000) + 31536000, // 1 year,
            ext: meta.mimeType,
            hash: hash,
            name: fileName,
            owner,
            status: 0,
            totalChunks: totalChunks,
            merkleRoot: '0'.repeat(64)
          }
        }
      })
      onCancel()

      onProgress?.(15)
      const fileKey = (
        await container.fileCotract.getFileKeyFromName({
          from: hiddenAddress,
          inputData: { names: [fileName] }
        })
      )[0]
      onCancel()

      let hexes: string[] = []
      let hashes: string[] = []
      let lastHash = '0x'.padEnd(66, '0')
      for (let index = 0; index < totalChunks; index++) {
        onCancel()

        const percent = Math.floor((index / totalChunks) * 0.8 * 100 + 15)
        onProgress?.(percent)

        const start = index * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, meta.size)

        const chunk = file.slice(start, end)
        const buffer = await chunk.arrayBuffer()
        const binary = new Uint8Array(buffer)
        const hex = hexlify(binary)
        const data = solidityPacked(['bytes32', 'bytes'], [lastHash, binary])

        lastHash = '0x' + (await sendCommand('createHash', { message: data, isHex: true })).hash

        hexes.push(hex)
        hashes.push(lastHash)

        //upload to blockchain
        if (hexes.length === limit || index === totalChunks - 1) {
          await container.fileCotract.uploadChunks({
            from: hiddenAddress,
            inputData: {
              chunkDatas: hexes,
              chunkHashes: hashes,
              fileKey: fileKey
            }
          })
          hexes = []
          hashes = []
        }
      }
      onProgress?.(100)
      return fileKey
    } catch (error: any) {
      throw error
    }
  }

  private async runWithConcurrency(tasks: Array<() => Promise<void>>, concurrency = 4) {
    const executing = new Set<Promise<void>>()

    for (const task of tasks) {
      const p = task().finally(() => executing.delete(p))

      executing.add(p)

      if (executing.size >= concurrency) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
  }

  private async downloadChunks(params: {
    account: Account
    fileKey: string
    totalChunks: number
    chunkLimit?: number
    concurrency?: number
    onProgress?: (percent: number) => void
  }) {
    const { account, fileKey, totalChunks, chunkLimit = 50, concurrency = 4, onProgress } = params

    const chunks: Uint8Array[] = new Array(totalChunks)

    let downloadedChunks = 0

    const tasks: Array<() => Promise<void>> = []

    for (let start = 0; start < totalChunks; start += chunkLimit) {
      tasks.push(async () => {
        const limit = Math.min(chunkLimit, totalChunks - start)

        const result: any = await container.fileCotract.downloadFile({
          from: account.hiddenAddress,
          inputData: {
            fileKey,
            start,
            limit
          }
        })

        const hexArray = Array.isArray(result) ? result : [result]

        hexArray.forEach((hex: string, index: number) => {
          const rawHex = hex.startsWith('0x') ? hex.slice(2) : hex

          chunks[start + index] = new Uint8Array(
            (rawHex.match(/[\da-f]{2}/gi) || []).map((byte) => parseInt(byte, 16))
          )
        })

        downloadedChunks += limit

        onProgress?.(Math.floor((downloadedChunks / totalChunks) * 100))
      })
    }

    await this.runWithConcurrency(tasks, concurrency)

    return chunks
  }

  async downloadFile(
    fileKey: string,
    account: Account,
    options?: {
      chunkLimit?: number
      concurrency?: number
      onProgress?: (percent: number) => void
    }
  ) {
    const { chunkLimit = 50, concurrency = 4, onProgress } = options ?? {}
    let cached = await container.fileCacheService.getFile(fileKey)
    console.log('down 1', cached)
    if (cached) {
      const { blob, ...meta } = cached
      return { blob: blob, meta }
    }
    onProgress?.(0)

    const { infos } = await container.fileCotract.getFilesInfo({
      from: account.hiddenAddress,
      inputData: {
        fileKeys: [fileKey]
      }
    })

    const meta = infos?.[0]
    if (!meta) {
      throw new Error('File not found')
    }

    const totalChunks = Number(meta.totalChunks)

    const chunks = await this.downloadChunks({
      account,
      fileKey,
      totalChunks,
      chunkLimit,
      concurrency,
      onProgress
    })

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0)

    const merged = new Uint8Array(totalSize)

    let offset = 0

    for (const chunk of chunks) {
      merged.set(chunk, offset)
      offset += chunk.length
    }
    const mimeType = meta?.ext || 'application/octet-stream'

    const blob = new Blob([merged], {
      type: mimeType
    })

    await container.fileCacheService.saveFile(fileKey, blob, mimeType, meta.name, '')
    onProgress?.(100)

    return {
      blob,
      meta: {
        ...meta,
        mimeType: meta?.ext
      }
    }
  }
}
