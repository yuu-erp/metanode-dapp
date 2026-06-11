import { methods } from '@/clients'
import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { formatAddress } from '@/shared/lib'
import { sendCommand } from '@metanodejs/system-core'
import { formatFileSize, getFileExt } from '../file/file.utils'
import { ttl } from './file-v2.const'

function toConnectionConfig(input: string) {
  const [ip, port] = input.split(':')
  return { ip, port, alpn: 'file-storage-v1' }
}

async function getChunk(
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
      signature: signature
    }
  }

  const payloadString = JSON.stringify(payload) + '\n'
  const response = await sendCommand('', {
    ...toConnectionConfig(serverAdd),
    payload: payloadString
  })
  let data
  try {
    data = JSON.parse(response)
  } catch (error) {
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
  await Promise.all(
    addresses.map((add) => sendCommand('connectQuicServer', toConnectionConfig(add)))
  )
  return addresses
}

async function disconnectQuic(addresses: string[]) {
  return await Promise.all(
    addresses.map((add) => sendCommand('disconnectQuicServer', toConnectionConfig(add)))
  )
}

async function getDownloadKey(fileId: string) {
  const account = await getCurrentAccount()
  const fileInfo = await methods.file.getFileInfo({
    fileKey: fileId
  })
  const price = await methods.file.calculatePrice({
    numChunks: fileInfo.totalChunks
  })
  const promise = new Promise((res) => {
    const off = container.eventLogContainer.eventLog.on('DownloadKeyGenerated', (e) => {
      if (account.address !== e.user || e.fileKey !== fileId) return
      off()
      res(e.downloadKey)
    })
  })

  await methods.file.payForDownload(
    {
      fileKey: fileId,
      downloadTimes: 1
    },
    { amount: price }
  )
  return { downloadKey: (await promise) as string, fileInfo }
}

async function getDownloadKeySign(input: string) {
  const { address } = await getCurrentAccount()
  const formatedKey = `0x00${formatAddress(input)}`
  const hash = await sendCommand('createHash', {
    message: formatedKey,
    isHex: false
  })

  if (window.fiaiSDK) {
    return (
      await sendCommand('signWithWallet', {
        algorithm: 'secp256k1',
        address: address,
        payload: hash
      })
    ).sign
  } else {
    const privateKey = (await sendCommand('getPrivateKeyFromDb', { address })).privateKey
    return (
      await sendCommand('createSignECDH', {
        message: hash,
        privateKey
      })
    ).sign
  }
}

function getMergedBinary(chunks: Uint8Array<ArrayBuffer>[]) {
  let totalLength = 0
  for (const chunk of chunks) {
    totalLength += chunk.length
  }

  const merged = new Uint8Array(totalLength)
  let offset = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    merged.set(chunk, offset)
    offset += chunk.length
  }
  return merged
}

export async function downloadFileV2(fileId: string) {
  const { downloadKey, fileInfo } = await getDownloadKey(fileId)
  const addresses = await connectQuic()
  const downloadKeySign = await getDownloadKeySign(downloadKey)

  const chunks = await Promise.all(
    Array.from({ length: fileInfo.totalChunks }, async (_, i) => {
      const server = i % 2 === 0 ? addresses[0] : addresses[1]
      let msg = ''
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const data = await getChunk(fileId, server, downloadKey, i, downloadKeySign)
          return data
        } catch (error: any) {
          msg = error?.message?.toLowerCase() || 'Unknown error'
          if (msg.includes('to store chunk on disk')) throw new Error(msg)
        }
      }

      throw new Error(`[Chunk ${i}] Request failed sau ${3} lần thử: ${msg}`)
    })
  )
  await disconnectQuic(addresses)
  const merged = getMergedBinary(chunks)

  const blob = new Blob([merged], {
    type: fileInfo.ext
  })

  return {
    blob,
    meta: {
      createdAt: (+fileInfo.expireTime - ttl) * 1000,
      displaySize: formatFileSize(+fileInfo.contentLen),
      extension: getFileExt(fileInfo.name),
      fileName: fileInfo.name,
      mimeType: fileInfo.ext,
      path: URL.createObjectURL(blob),
      size: +fileInfo.contentLen
    }
  }
}
