import { methods } from '@/clients'
import { getCurrentAccount } from '@/shared/hooks'
import { buildTree, getProof } from './merkle-tree'
import { ttl } from './file-v2.const'
import { container } from '@/container'

export async function uploadFileV2(file: Blob, onProgress?: (v: number) => void) {
  onProgress?.(0)
  console.log('uploadFileV2 1', file)
  const rs = await buildTree(file)
  console.log('uploadFileV2 2', rs)

  onProgress?.(30)

  const account = await getCurrentAccount()

  const price = await methods.file.calculatePrice({
    numChunks: rs.totalChunk
  })
  console.log('uploadFileV2 3', price)

  onProgress?.(35)

  const expireTime = Math.floor(Date.now() / 1000) + ttl

  const name = (file as any)?.name || ''
  const contentLen = file.size

  const promise = new Promise((res) => {
    container.eventLogContainer.eventLog.on('FileAdded', (e) => {
      if (+contentLen !== +e.contentLen && e.name !== name) return
      res(e.fileKey)
    })
  })

  const [fileKey] = await Promise.all([
    promise,
    methods.file.pushFileInfo(
      {
        info: {
          owner: account.address,
          merkleRoot: rs.root,
          contentLen: contentLen,
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
  console.log('uploadFileV2 4', fileKey)

  onProgress?.(45)

  await Promise.all(
    rs.chunks.map(async (chunk, i) => {
      const proof = getProof(rs.levels, i)
      const chunkDataHex =
        '0x' +
        Array.from(chunk)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')

      console.log('thanhduy - upload chunk ------- 1')
      try {
        await methods.file.uploadChunk({
          fileKey: fileKey,
          chunkData: chunkDataHex,
          merkleProof: proof,
          chunkIndex: i
        })
      } catch (error) {
        console.error('thanhduy - upload chunk error', error)
      }
      console.log('thanhduy - upload chunk ------- 2')
    })
  )
  console.log('uploadFileV2 5')

  onProgress?.(100)
  return fileKey
}
