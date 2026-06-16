import { methods } from '@/clients'
import { getCurrentAccount } from '@/shared/hooks'
import { buildTree, calculateHashWork, getProof } from './merkle-tree'
import { container } from '@/container'
import { ttl } from '../configs'
import { WorkerQueue } from '../worker-queue'

export async function uploadFileV2(file: Blob, onProgress?: (v: number) => void, fileKey?: string) {
  let completedWork = 0

  const report = (totalWork: number) => {
    const progress = Math.floor((completedWork / totalWork) * 100)

    onProgress?.(Math.min(progress, 100))
  }

  const totalChunks = Math.ceil(file.size / (1024 * 250))
  const totalHashWork = calculateHashWork(totalChunks)
  const totalWork = totalHashWork + totalChunks

  report(totalWork)

  const rs = await buildTree(file, () => {
    completedWork++
    report(totalWork)
  })

  const account = await getCurrentAccount()

  const price = await methods.file.calculatePrice({
    numChunks: rs.totalChunk
  })

  const expireTime = Math.floor(Date.now() / 1000) + ttl
  const name = (file as any)?.name || ''
  const contentLen = file.size

  if (!fileKey) {
    const promise = new Promise((res) => {
      container.eventLogContainer.eventLog.on('FileAdded', (e) => {
        if (+contentLen !== +e.contentLen && e.name !== name) {
          return
        }

        res(e.fileKey)
      })
    })

    const [rs1] = await Promise.all([
      promise,
      methods.file.pushFileInfo(
        {
          info: {
            owner: account.address,
            merkleRoot: rs.root,
            contentLen,
            totalChunks: rs.totalChunk,
            expireTime,
            name,
            ext: file.type,
            contentDisposition: 'inline',
            contentID: rs.root,
            status: 0
          }
        },
        { amount: price }
      )
    ])

    fileKey = rs1 as string
  }

  const queue = new WorkerQueue(5) // upload tối đa 5 chunk cùng lúc

  for (const [i, chunk] of rs.chunks.entries()) {
    console.log('testasfsfsa', i)
    const proof = getProof(rs.levels, i)

    const chunkDataHex =
      '0x' +
      Array.from(chunk)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    try {
      await methods.file.uploadChunk({
        fileKey,
        chunkData: chunkDataHex,
        merkleProof: proof,
        chunkIndex: i
      })
    } catch (error) {
      console.error('thanhduy - upload chunk error', error)
    } finally {
      completedWork++
      report(totalWork)
    }
    // queue.enqueue(async () => {

    // })
  }

  await queue.onIdle()

  onProgress?.(100)

  return fileKey
}
