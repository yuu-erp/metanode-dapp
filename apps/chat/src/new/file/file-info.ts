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
          fileKeys: [fileId!],
        },
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
        path,
      } as FileMeta
    },
  })

export function useFileMetaById(fileId?: string) {
  return useQuery(createFileMetaQuery(fileId))
}

function isOnChainFileKey(fileId: string) {
  return /^[0-9a-f]{64}$/i.test(fileId)
}

/** Ưu tiên meta optimistic trong cache; chỉ fetch on-chain với fileKey 64 hex. */
export function useFileMetaDisplay(fileId?: string) {
  const cacheKey = fileId ? FILE_QUERY_KEY.info(fileId) : undefined

  return useQuery({
    queryKey: cacheKey!,
    enabled: !!fileId,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    initialData: () =>
      fileId ? queryClient.getQueryData<FileMeta>(FILE_QUERY_KEY.info(fileId)) : undefined,
    placeholderData: () =>
      fileId ? queryClient.getQueryData<FileMeta>(FILE_QUERY_KEY.info(fileId)) : undefined,
    queryFn: async () => {
      const cached = queryClient.getQueryData<FileMeta>(FILE_QUERY_KEY.info(fileId!))
      if (cached) return cached
      if (!isOnChainFileKey(fileId!)) {
        throw new Error('[useFileMetaDisplay] Missing local file meta')
      }
      return queryClient.fetchQuery(createFileMetaQuery(fileId))
    },
  })
}

export function getFileMetaFromCache(fileId: string) {
  return queryClient.getQueryData<FileMeta>(FILE_QUERY_KEY.info(fileId))
}

export function setFilePath(fileId: string, path: string) {
  queryClient.setQueryData(FILE_QUERY_KEY.info(fileId), (old) => {
    return old ? { ...old, path } : old
  })
}

export function setFileMetadata(id: string, input: Partial<FileMeta>) {
  queryClient.setQueryData(FILE_QUERY_KEY.info(id), (old) => {
    const merged = old ? { ...old, ...input } : { ...input }
    return merged as FileMeta
  })
}
