import { handleDownloadFile } from '@/new/file/down-file-to-device'
import { useFileMetaById } from '@/new/file/file-info'
import { cn } from '@/shared/lib'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { Download, File, X } from 'lucide-react'
import { memo, type PropsWithChildren } from 'react'
import type { WithMessage } from '../types'
import { MessageText } from '@/shared/components/message-render'

const mediaStyle = 'object-cover aspect-square max-w-[20vw] rounded-md'

const WithWrapper = ({
  children,
  isWrapped,
  className
}: { isWrapped?: boolean; className?: string } & PropsWithChildren) => {
  if (!isWrapped) return children
  return (
    <div
      className={cn(
        'w-12 h-12 flex items-center justify-center rounded-full shrink-0 relative',
        className
      )}
    >
      {children}
    </div>
  )
}

export const FileContent = memo(({ data }: WithMessage) => {
  const { isMine } = data
  const upProgress = useUiStore((s) => s.upFileProgress[data.id])
  const { data: meta } = useFileMetaById(data.fileId)

  const path = meta?.path
  const isImage = meta?.mimeType.startsWith('image')
  const isVideo = meta?.mimeType.startsWith('video')
  const isDefault = !isImage && !isVideo

  const fileDisplay = isDefault ? (
    <File />
  ) : isImage ? (
    <img className={mediaStyle} src={path} draggable={false} alt={meta?.fileName} />
  ) : (
    <video className={mediaStyle} src={path} controls />
  )

  const uploadedSize =
    upProgress == null || !meta?.size
      ? null
      : `${((meta.size * upProgress) / 100 / 1024 / 1024).toFixed(1)} MB`

  const download = async () => {
    if (meta?.path) return window.open(meta?.path, '_blank')
    handleDownloadFile(data)
  }

  const cancel = () => {
    if (upProgress == null) return
    uiActions.addCancelId(data.id)
  }

  return (
    <>
      <div className="flex gap-3 items-center">
        <div onClick={upProgress != null ? cancel : !path ? download : undefined}>
          <WithWrapper
            isWrapped={isDefault}
            className={isMine ? 'bg-blue-500 text-blue-200' : 'bg-blue-200 text-[#3b82f6]'}
          >
            {upProgress != null ? <X /> : !!path ? fileDisplay : <Download />}
          </WithWrapper>
        </div>

        {meta && (
          <>
            <div className={cn('flex-1 min-w-0', isMine ? 'text-white' : 'text-black')}>
              <div className="text-sm font-medium truncate">{meta.fileName}</div>
              <div className="text-xs opacity-70">
                {upProgress != null ? `${uploadedSize} / ${meta.displaySize}` : meta.displaySize}
              </div>
            </div>
          </>
        )}
      </div>
      {!!data?.content && <MessageText className="mt-3" message={data} />}
    </>
  )
})
