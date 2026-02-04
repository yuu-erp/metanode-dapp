import { container } from '@/container'
import { useEffect, useState } from 'react'
import type { FileCache } from '@/modules/file-cache'

export const useCachedFile = (fileKey?: string) => {
  const [cachedFile, setCachedFile] = useState<FileCache | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!fileKey) return

    const fetchCache = async () => {
      setIsLoading(true)
      try {
        const file = await container.fileCacheService.getFile(fileKey)
        setCachedFile(file)
      } catch (error) {
        console.error('Failed to fetch cached file:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCache()

    const handler = (event: { fileKey: string }) => {
      if (event.fileKey === fileKey) {
        fetchCache()
      }
    }

    container.eventBus.on('file.cached', handler)

    return () => {
      container.eventBus.off('file.cached', handler)
    }
  }, [fileKey])

  return { cachedFile, isLoading }
}
