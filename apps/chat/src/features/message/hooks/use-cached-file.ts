import { container } from '@/container'
import { FILE_CACHE_QUERY_KEY } from '@/shared/lib/react-query'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const useCachedFile = (fileKey?: string) => {
  const queryClient = useQueryClient()

  // Subscribe to file.cached events to invalidate query
  useEffect(() => {
    if (!fileKey) return

    const handler = (event: { fileKey: string }) => {
      if (event.fileKey === fileKey) {
        queryClient.invalidateQueries({
          queryKey: FILE_CACHE_QUERY_KEY.GET_FILE(fileKey)
        })
      }
    }

    container.eventBus.on('file.cached', handler)

    return () => {
      container.eventBus.off('file.cached', handler)
    }
  }, [fileKey, queryClient])

  // Use React Query
  const { data: cachedFile, isLoading } = useQuery({
    queryKey: FILE_CACHE_QUERY_KEY.GET_FILE(fileKey!),
    queryFn: async () => {
      if (!fileKey) return undefined
      return container.fileCacheService.getFile(fileKey)
    },
    enabled: !!fileKey,
    staleTime: Infinity, // Cache forever (immutable by hash/key)
    gcTime: 1000 * 60 * 60 // Keep in memory for 1 hour
  })

  return { cachedFile, isLoading }
}
