import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import { FILE_QUERY_KEY, queryClient } from '@/shared/lib/react-query'
import type { FileMeta } from '@/stores/file.store'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { formatFileSize } from './file.utils'

function removeTimestamp(filename: string) {
  return filename.replace(/_\d+$/, '')
}

function getExt(filename: string) {
  return filename.split('.').pop() ?? ''
}

export const createFileMetaQuery = (fileId?: string) =>
  queryOptions({
    queryKey: FILE_QUERY_KEY.info(fileId!),
    enabled: !!fileId,
    queryFn: async () => {
      const account = await getCurrentAccount()

      const { infos } = await container.fileCotract.getFilesInfo({
        from: account.hiddenAddress,
        inputData: {
          fileKeys: [fileId!]
        }
      })

      const meta = infos?.[0]
      if (!meta) {
        throw new Error('[createFileInfoQuery] File not found')
      }
      const fileName = removeTimestamp(meta.name)
      const size = +meta.contentLen
      let path = ''
      const cache = await container.fileCacheService.getFile(fileId!)
      if (cache?.blob) {
        path = URL.createObjectURL(cache.blob)
      }

      return {
        mimeType: meta?.ext || '',
        extension: getExt(fileName),
        size,
        displaySize: formatFileSize(size),
        fileName: fileName,
        path
      } as FileMeta
    }
  })

export function useFileMetaById(fileId?: string) {
  return useQuery(createFileMetaQuery(fileId))
}

export function setFilePath(fileId: string, path: string) {
  queryClient.setQueryData(FILE_QUERY_KEY.info(fileId), (old) => {
    return old ? { ...old, path } : old
  })
}

export function setFileMetadata(id: string, input: Partial<FileMeta>) {
  queryClient.setQueryData(FILE_QUERY_KEY.info(id), (old) => {
    return old ? { ...old, ...input } : input
  })
}
