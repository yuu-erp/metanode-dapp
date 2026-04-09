import { container } from '@/container'
import type { MessageService } from '@/modules/message'
import { useCurrentAccount } from '@/shared/hooks'
import { useCallback, useState } from 'react'

export function useDownloadFile() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadedFileId, setDownloadedFileId] = useState<string | null>(null)
  const { data: account } = useCurrentAccount()
  const messageService = container.messageService as MessageService

  const downloadFile = useCallback(
    async (
      fileId: string,
      fileKey: string,
      fileName: string,
      mimeType: string,
      skipCache?: boolean
    ) => {
      if (!account) return

      setIsDownloading(true)
      setDownloadedFileId(fileId)
      setProgress(0)

      try {
        await messageService.downloadFile(
          account,
          fileKey,
          fileName,
          mimeType,
          (percent) => {
            setProgress(percent)
          },
          skipCache
        )
      } catch (error) {
        console.error('Download failed:', error)
        // toast.error('Failed to download file')
      } finally {
        setIsDownloading(false)
        setDownloadedFileId(null)
        setProgress(0)
      }
    },
    [account, messageService]
  )

  return {
    isDownloading,
    progress,
    downloadedFileId,
    downloadFile
  }
}
