'use client'

import { usePlatform } from '@/hooks/core/use-platform'
import { formatBytes } from '@/shared/lib'
import { fileActions, useFileStore, type FileItem } from '@/stores/file.store'
import { FileIcon, X } from 'lucide-react'

export interface SelectedFileListProps {}

function FileItemUi({ item, onRemove }: { item: FileItem; onRemove?: () => void }) {
  const { meta } = item
  const isPreview = item.meta?.mimeType?.startsWith('image')
  const { isNotWeb } = usePlatform()
  const prefixValue = 'image://img.m.pro'
  const prefix = isNotWeb && !meta.path.startsWith(prefixValue) ? prefixValue : ''
  const path = prefix + meta.path

  return (
    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 group">
      <div className="flex items-center justify-center size-12 rounded-xl bg-white/10 shrink-0 overflow-hidden">
        {isPreview ? (
          <img src={path} alt={''} className="size-full object-cover" />
        ) : (
          <FileIcon className="size-4 text-white/80" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-sm font-medium text-white/90 truncate">{meta.fileName}</p>
        <p className="text-xs text-white/50">{formatBytes(meta.size)}</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function SelectedFileList({}: SelectedFileListProps) {
  const items = useFileStore((s) => s.items)

  if (!items.length) return null
  return (
    <div className="flex flex-col gap-1 w-full mb-2 max-h-40 overflow-y-auto no-scrollbar custom-scrollbar pt-2">
      {items.map((item, i) => (
        <FileItemUi key={i} item={item} onRemove={() => fileActions.removeItem(i)} />
      ))}
    </div>
  )
}
