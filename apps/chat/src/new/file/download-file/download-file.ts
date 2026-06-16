import { methods } from '@/clients'
import { container } from '@/container'
import { setFilePath } from '@/new/file/file-info'
import { getCurrentAccount } from '@/shared/hooks'
import { compareAddress, formatAddress } from '@/shared/lib'
import { FILE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { uiActions } from '@/stores/ui.store'
import { sendCommand } from '@metanodejs/system-core'
import { downloadFileByWebTransport } from './down-by-web-transport'
import { downByRawQuic } from './download-by-raw-quic'

async function getDownloadKey(fileId: string) {
  try {
    let fileInfo = await methods.file.getFileInfo({
      fileKey: fileId
    })
    if (typeof fileInfo === 'string') fileInfo = JSON.parse(fileInfo)

    const price = await methods.file.calculatePrice({
      numChunks: fileInfo.totalChunks
    })

    const promise = new Promise((res) => {
      //@ts-ignore
      const off = container.eventLogContainer.eventLog.on('DownloadKeyGenerated', (e) => {
        if (!compareAddress(e.fileKey, fileId)) return

        off()
        res(e.downloadKey)
      })
    })
    console.log('price', price)
    await methods.file.payForDownload(
      {
        fileKey: fileId,
        downloadTimes: 1
      },
      { amount: price }
    )
    const downloadKey = (await promise) as string

    return { downloadKey: formatAddress(downloadKey), fileInfo }
  } catch (error) {
    console.error('get download key error', error)
    throw error
  }
}

async function getDownloadKeySign(input: string) {
  const { address } = await getCurrentAccount()
  const formatedKey = `0x00${formatAddress(input)}`
  const hash = (
    await sendCommand('createHash', {
      message: formatedKey,
      isHex: false
    })
  ).hash
  console.log('getDownloadKeySign tessss 2', { address, formatedKey, hash })

  if (window.fiaiSDK) {
    const rs = (
      await sendCommand('signWithWallet', {
        algorithm: 'secp256k1',
        address: address,
        payload: hash
      })
    ).signature
    console.log('getDownloadKeySign tessss 2', { rs })
    return rs
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

async function downloadFile(fileId: string) {
  let cached = await container.fileCacheService.getFile(fileId)
  if (cached) {
    const { blob, ...meta } = cached
    return { blob: blob, meta }
  }

  const { downloadKey, fileInfo } = await getDownloadKey(fileId)
  uiActions.setUpFileProgress(fileId, 5)
  const downloadKeySign = await getDownloadKeySign(downloadKey)
  uiActions.setUpFileProgress(fileId, 10)

  const onProgress = (v) => uiActions.setUpFileProgress(fileId, 10 + v * 90)

  const blob = window.fiaiSDK
    ? await downloadFileByWebTransport(fileId, fileInfo, downloadKey, downloadKeySign, onProgress)
    : await downByRawQuic(fileId, fileInfo, downloadKey, downloadKeySign, onProgress)
  const fileName = fileInfo.name
  const mimeType = fileInfo.ext

  await container.fileCacheService.saveFile(fileId, blob, mimeType, fileName, '')

  return {
    blob,
    meta: { fileName, mimeType }
  }
}

export async function handleDownloadFile(message: FulleMessage) {
  const fileId = message.fileId
  console.log('tset down file ', fileId)
  if (!fileId) return
  uiActions.setUpFileProgress(fileId, 0)

  try {
    if (!fileId) throw new Error('[downFileToCache] Invalid fileId')
    const { blob, meta } = await downloadFile(fileId)

    const path = ((await queryClient.getQueryData(FILE_QUERY_KEY.info(fileId))) as any)?.path

    if (!path) {
      const newPath = URL.createObjectURL(blob)
      setFilePath(fileId, newPath)
    }

    if (!!window.fiaiSDK && 'showSaveFilePicker' in window) {
      let ext: string = meta.fileName.match(/\.[^.]+$/)?.[0] ?? ''
      ext = ext.split('_')[0]
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: meta.fileName,
        types: [
          {
            description: 'desc',
            accept: {
              [meta.mimeType]: [ext]
            }
          }
        ]
      })

      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
    }
  } catch (error) {
    console.error(error)
  } finally {
    uiActions.setUpFileProgress(fileId, 100)
  }
}
