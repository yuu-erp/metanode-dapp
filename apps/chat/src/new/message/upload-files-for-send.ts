import type { FileItem } from '@/stores/file.store'
import { v4 as uuidv4 } from 'uuid'
import { setFileMetadata, setFilePath } from '../file/file-info'
import { appConfig, createFileModule } from '@metanodejs/file-module'
import { getCurrentAccount } from '@/shared/hooks'

export const FILE_UPLOAD_NOT_IMPLEMENTED = 'File upload not implemented'

function createMessagePreviewUrl(item: FileItem): string {
  const blob = item.file
  if (blob && item.meta.mimeType.startsWith('image/')) {
    return URL.createObjectURL(blob)
  }
  if (blob && item.meta.mimeType.startsWith('video/')) {
    return URL.createObjectURL(blob)
  }
  return item.path ?? item.meta.path ?? ''
}

/**
 * Gán id tạm + cache meta/preview local cho optimistic.
 * `readlIds` hiện throw — sau này thay bằng upload thật và resolve fileKey[] rồi `handleSendMessage` gọi chain.
 */
export function prepareFilesForSend(items: FileItem[]) {
  if (!items.length) {
    throw new Error('prepareFilesForSend: no files')
  }

  const ids = items.map(() => uuidv4().replace(/-/g, ''))

  console.log('prepareFilesForSend items', items)

  items.forEach((item, index) => {
    const fileKey = ids[index]!
    const previewPath = createMessagePreviewUrl(item)
    const mimeType = item.meta.mimeType || (item.file instanceof File ? item.file.type : '')

    setFileMetadata(fileKey, {
      ...item.meta,
      mimeType: mimeType || item.meta.mimeType,
      path: previewPath,
    })

    if (previewPath) {
      setFilePath(fileKey, previewPath)
    }
  })

  const readlIds = (async (): Promise<string[]> => {
    const modules = createFileModule()
    const account = await getCurrentAccount()
    await modules.initialize(account.hiddenAddress, appConfig.file)
    const uploadUseCase = modules.getUploadFileUseCase()
    const setPublicStatusUseCase = modules.getSetPublicStatusUseCase()

    const keys: string[] = []

    for (const item of items) {
      const results = await uploadUseCase.execute({
        file: item.file as File,
        from: account.hiddenAddress,
        chunkSize: 1024 * 1024,
      })
      await setPublicStatusUseCase.execute({
        fileKey: results.fileKey,
        from: account.hiddenAddress,
        status: true,
      })
      keys.push(results.fileKey)
    }

    return keys
  })()

  return { ids, readlIds }
}
