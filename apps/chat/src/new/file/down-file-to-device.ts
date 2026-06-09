import { fileHandler } from '@/clients'
import { getCurrentAccount } from '@/shared/hooks'
import { FILE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import { uiActions } from '@/stores/ui.store'
import { setFilePath } from './file-info'

export async function handleDownloadFile(message: FulleMessage) {
  const fileId = message.fileId
  if (!fileId) throw new Error('[downFileToCache] Invalid fileId')
  const account = await getCurrentAccount()
  const { blob, meta } = await fileHandler.downloadFile(fileId, account, {
    onProgress: (v) => uiActions.setUpFileProgress(message.id, v)
  })

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
}
