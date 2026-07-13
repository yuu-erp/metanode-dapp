'use client'

import { formatFileSize } from '@/new'
import { removeSelectedId, useMetadata, useSelectedIds, useCache } from 'file-core'
import { FileIcon, X } from 'lucide-react'

export interface SelectedFileListProps {}

function FileItemUi({ id }: { id: string }) {
  const { metadata } = useMetadata(id)
  const { cache } = useCache(id)
  if (!metadata || !cache) return null
  return (
    <div className="flex items-cenPter gap-2 p-1 rounded-2xl bg-white/5 border border-black/10 group">
      <div className="flex items-center justify-center size-12 rounded-xl bg-white/10 shrink-0 overflow-hidden">
        {cache.previewType === 'image' && cache.previewPath ? (
          <img src={cache.previewPath} alt={''} className="size-full object-cover" />
        ) : (
          <FileIcon className="size-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-sm font-medium truncate">{metadata.name}</p>
        <p className="text-xs">{formatFileSize(metadata.size)}</p>
      </div>

      <button
        type="button"
        onClick={() => removeSelectedId(id)}
        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function SelectedFileList({}: SelectedFileListProps) {
  const { ids } = useSelectedIds()
  if (!ids.length) return null
  return (
    <div className="flex flex-col gap-1 w-full mb-2 max-h-40 overflow-y-auto no-scrollbar custom-scrollbar pt-2">
      {ids.map((id, i) => (
        <FileItemUi key={i} id={id} />
      ))}
    </div>
  )
}
