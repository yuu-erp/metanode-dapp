import { useOpenOverlay } from '@/hooks/use-open-overlay'
import { MessageText } from '@/shared/components/message-render'
import { cn } from '@/shared/lib'
import { Download, File, LoaderCircle } from 'lucide-react'
import { memo, type MouseEvent, type PropsWithChildren } from 'react'
import type { WithMessage } from '../types'
import { formatFileSize } from '@/new'
import { useFilePreview } from '@/new/file/use-file-preview'
import { ViewImageModal } from './view-image-modal'

const mediaStyle = 'object-cover aspect-square w-16 rounded-md'

const WithWrapper = ({
  children,
  isWrapped,
  className,
}: { isWrapped?: boolean; className?: string } & PropsWithChildren) => {
  if (!isWrapped) return children
  return (
    <div
      className={cn(
        'w-12 h-12 flex items-center justify-center rounded-full shrink-0 relative',
        className,
      )}
    >
      {children}
    </div>
  )
}

const FileItem = ({
  id,
  isMine,
  messageId,
}: {
  id: string
  isMine?: boolean
  messageId: string
}) => {
  const { metadata, previewUrl, previewType, loadState, hasPreview, isMetaLoading } =
    useFilePreview(id)
  const { behavior } = useOpenOverlay({ id: messageId, fileId: id })

  if (isMetaLoading) {
    return (
      <div className="flex items-center gap-2 py-1">
        <LoaderCircle className="size-5 animate-spin opacity-70" />
      </div>
    )
  }

  if (!metadata?.fileName) return null

  const finalBehavior = hasPreview
    ? behavior
    : {
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        },
      }

  const showDownloading = loadState === 'downloading'
  const showDownloadIdle =
    !hasPreview &&
    (loadState === 'error' ||
      loadState === 'unsupported' ||
      loadState === 'idle' ||
      loadState === 'ready')

  return (
    <div className="flex gap-3 items-center" {...finalBehavior}>
      <div className="relative">
        {hasPreview && previewType === 'image' && (
          <ViewImageModal fileId={id} messageId={messageId}>
            <img
              src={previewUrl}
              className={mediaStyle}
              draggable={false}
              alt={metadata.fileName}
            />
          </ViewImageModal>
        )}
        {hasPreview && previewType === 'video' && (
          <ViewImageModal fileId={id} messageId={messageId}>
            <video src={previewUrl} className={mediaStyle} draggable={false} />
          </ViewImageModal>
        )}

        {!hasPreview && (
          <WithWrapper
            isWrapped
            className={isMine ? 'bg-blue-500 text-blue-200' : 'bg-blue-200 text-[#3b82f6]'}
          >
            {showDownloading ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : showDownloadIdle ? (
              loadState === 'unsupported' ? (
                <File className="size-5" />
              ) : (
                <Download className="size-5" />
              )
            ) : (
              <File className="size-5" />
            )}
          </WithWrapper>
        )}

        {hasPreview && showDownloading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
            <LoaderCircle className="size-5 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className={cn('flex-1 min-w-0', isMine ? 'text-white' : 'text-black')}>
        <div className="text-sm font-medium truncate">{metadata.fileName}</div>
        <div className="text-xs opacity-70">
          {showDownloading ? 'Đang tải…' : formatFileSize(metadata.size)}
        </div>
      </div>
    </div>
  )
}

export const FileContent = memo(({ data }: WithMessage) => {
  const fileIds = data.fileIds ?? []
  const { isMine } = data

  return (
    <>
      <div className="flex flex-col gap-2">
        {fileIds.map((id) => (
          <FileItem key={id} id={id} isMine={isMine} messageId={data.id} />
        ))}
      </div>
      {!!data?.content && <MessageText className="mt-3" message={data} />}
    </>
  )
})
