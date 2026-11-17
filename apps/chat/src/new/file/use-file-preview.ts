import { container } from '@/container'
import { getCurrentAccount } from '@/shared/hooks'
import type { FileMeta } from '@/stores/file.store'
import { useEffect, useMemo, useState } from 'react'
import { downloadFileBytesByKey } from './download-file-by-key'
import {
  isOnChainFileKey,
  mapBcInfoToFileMeta,
  setFileMetadata,
  setFilePath,
  useFileMetaDisplay,
} from './file-info'
import { resolveContentMimeType, resolvePreviewType } from './file.utils'

export type FilePreviewLoadState =
  | 'idle'
  | 'local'
  | 'downloading'
  | 'ready'
  | 'error'
  | 'unsupported'

function isLocalPreviewPath(path?: string) {
  const value = path?.trim()
  return Boolean(value && (value.startsWith('blob:') || value.startsWith('data:')))
}

export function useFilePreview(fileId: string) {
  const { data: optimisticMeta } = useFileMetaDisplay(fileId, { fetchOnChain: false })
  const [chainMeta, setChainMeta] = useState<FileMeta | undefined>()
  const [isChainMetaLoading, setIsChainMetaLoading] = useState(false)

  const metadata = optimisticMeta ?? chainMeta

  const contentMimeType = useMemo(
    () =>
      metadata
        ? resolveContentMimeType(metadata.mimeType || metadata.extension, metadata.fileName)
        : '',
    [metadata],
  )

  const previewType = useMemo(() => resolvePreviewType(metadata), [metadata])
  const isVisual = previewType === 'image' || previewType === 'video'

  const [previewUrl, setPreviewUrl] = useState<string | undefined>()
  const [loadState, setLoadState] = useState<FilePreviewLoadState>('idle')

  useEffect(() => {
    setChainMeta(undefined)
  }, [fileId])

  useEffect(() => {
    if (!fileId || !isOnChainFileKey(fileId) || optimisticMeta) return

    let cancelled = false
    setIsChainMetaLoading(true)
    ;(async () => {
      try {
        const account = await getCurrentAccount()
        const { infos } = await container.fileCotract.getFilesInfo({
          from: account.hiddenAddress,
          inputData: {
            fileKeys: [fileId],
          },
        })
        const info = infos?.[0]
        if (!info || cancelled) return

        const mapped = await mapBcInfoToFileMeta(fileId, info)
        if (cancelled) return

        setChainMeta(mapped)
        setFileMetadata(fileId, mapped)
      } catch (error) {
        if (!cancelled) {
          console.log('[useFilePreview] getFilesInfo error', { fileId, error })
        }
      } finally {
        if (!cancelled) setIsChainMetaLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fileId, optimisticMeta])

  useEffect(() => {
    if (!metadata) {
      setPreviewUrl(undefined)
      setLoadState('idle')
      return
    }

    // Chỉ dùng path có sẵn khi là preview optimistic (blob/data). File tải từ chain thường path rỗng.
    const localPath = metadata.path?.trim()
    if (isLocalPreviewPath(localPath)) {
      setPreviewUrl(localPath)
      setLoadState(optimisticMeta ? 'local' : 'ready')
      return
    }

    if (!isVisual) {
      setPreviewUrl(undefined)
      setLoadState('unsupported')
      return
    }

    let cancelled = false
    setPreviewUrl(undefined)
    setLoadState('downloading')

    downloadFileBytesByKey(fileId)
      .then((bytes) => {
        if (cancelled) return
        const blob = new Blob([new Uint8Array(bytes)], {
          type: contentMimeType || 'application/octet-stream',
        })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setFilePath(fileId, url)
        setChainMeta((m) => (m ? { ...m, path: url } : m))
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })

    return () => {
      cancelled = true
    }
  }, [
    fileId,
    metadata,
    metadata?.path,
    metadata?.fileName,
    metadata?.size,
    optimisticMeta,
    contentMimeType,
    isVisual,
    previewType,
  ])

  const hasPreview = Boolean(previewUrl && previewType)

  return {
    metadata,
    previewUrl,
    previewType,
    loadState,
    hasPreview,
    isMetaLoading: isChainMetaLoading && !metadata,
  }
}
