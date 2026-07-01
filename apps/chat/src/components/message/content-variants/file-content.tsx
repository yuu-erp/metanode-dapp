import { useOpenOverlay } from '@/hooks/use-open-overlay'
import { MessageText } from '@/shared/components/message-render'
import { cn } from '@/shared/lib'
import { loadFile, useFileCache, useFileState, useMetadata } from 'file-core'
import { Download, File, X } from 'lucide-react'
import { memo, type PropsWithChildren } from 'react'
import type { WithMessage } from '../types'
import { formatFileSize } from '@/new'
import { useCurrentState } from '@/hooks/use-current-state'

const mediaStyle = 'object-cover aspect-square w-16 rounded-md'

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

const FileItem = ({
  id,
  isMine,
  messageId
}: {
  id: string
  isMine?: boolean
  messageId: string
}) => {
  const { account } = useCurrentState()
  const { metadata } = useMetadata(id)
  const { cache } = useFileCache(id)
  const isStored = !!cache
  const { status, progress = 0 } = useFileState(id)
  const { behavior } = useOpenOverlay({ id: messageId, fileId: id })

  if (!metadata) return null
  const { previewType = '', previewPath } = cache ?? {}
  const comps = {
    image: () => (
      <img src={previewPath} className={mediaStyle} draggable={false} alt={metadata.name} />
    ),
    default: () => <File />
  }

  const Comp = cache ? (comps[previewType] ?? comps.default) : comps.default
  const uploadedSize = formatFileSize(metadata.size * (progress / 100))

  const finalBehavior = isStored
    ? behavior
    : {
        onClick: () => loadFile(id, account?.address ?? '')
      }

  return (
    <div className="flex gap-3 items-center" {...finalBehavior}>
      <div className="relative">
        {isStored && <Comp />}
        {!isStored && (
          <WithWrapper
            isWrapped={true}
            className={isMine ? 'bg-blue-500 text-blue-200' : 'bg-blue-200 text-[#3b82f6]'}
          >
            {status === 'idle' && <Download />}
          </WithWrapper>
        )}

        {status === 'pending' && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center flex flex-col gap-1',
              isStored && 'bg-black/20'
            )}
          >
            <X />
          </div>
        )}
      </div>

      <div className={cn('flex-1 min-w-0', isMine ? 'text-white' : 'text-black')}>
        <div className="text-sm font-medium truncate">{metadata.name}</div>
        <div className="text-xs opacity-70">
          {status === 'pending'
            ? `${uploadedSize} / ${formatFileSize(metadata.size)}`
            : formatFileSize(metadata.size)}
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
      {/* <div className="flex gap-3 items-center">
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
      </div> */}
      {!!data?.content && <MessageText className="mt-3" message={data} />}
    </>
  )
})
