import { methods } from '@/clients'
import { getCurrentAccount } from '@/shared/hooks'
import { buildTree, getProof } from './merkle-tree'
import { ttl } from './file-v2.const'

export async function uploadFileV2(file: Blob, onProgress?: (v: number) => void) {
  onProgress?.(0)

  const rs = await buildTree(file)
  onProgress?.(30)

  const account = await getCurrentAccount()

  const price = await methods.file.calculatePrice({
    numChunks: rs.totalChunk
  })
  onProgress?.(35)

  const expireTime = Math.floor(Date.now() / 1000) + ttl

  const { fileKey } = await methods.file.pushFileInfo(
    {
      info: {
        owner: account.address,
        merkleRoot: rs.root,
        contentLen: file.size,
        totalChunks: rs.totalChunk,
        expireTime,
        name: (file as any)?.name || '',
        ext: file.type,
        contentDisposition: 'inline',
        contentID: rs.root,
        status: 0
      }
    },
    { amount: price }
  )
  onProgress?.(45)

  await Promise.all(
    rs.chunks.map(async (chunk, i) => {
      const proof = getProof(rs.levels, i)
      const chunkDataHex =
        '0x' +
        Array.from(chunk)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')

      await methods.file.uploadChunk({
        fileKey: fileKey,
        chunkData: chunkDataHex,
        merkleProof: proof,
        chunkIndex: i
      })
    })
  )
  onProgress?.(100)
  return fileKey
}
