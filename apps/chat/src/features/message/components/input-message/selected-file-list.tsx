'use client'

import { FileIcon, X } from 'lucide-react'
import type { FileItem } from '@/stores/file.store'
import { fileActions, useFileStore } from '@/stores/file.store'

function FileItemUi({ item, index }: { item: FileItem; index: number }) {
  const isImage = item.meta.mimeType.startsWith('image/')
  const previewUrl = isImage ? (item.path ?? item.meta.path) || undefined : undefined

  return (
    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-black/10 group">
      <div className="flex items-center justify-center size-12 rounded-xl bg-white/10 shrink-0 overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <FileIcon className="size-4" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-sm font-medium truncate">{item.meta.fileName}</p>
        <p className="text-xs">{item.meta.displaySize}</p>
      </div>

      <button
        type="button"
        onClick={() => fileActions.removeItem(index)}
        className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
        aria-label="Xóa file"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function SelectedFileList() {
  const items = useFileStore((s) => s.items)

  if (!items.length) return null

  return (
    <div className="flex flex-col gap-1 w-full mb-2 max-h-40 overflow-y-auto no-scrollbar custom-scrollbar pt-2">
      {items.map((item, index) => (
        <FileItemUi
          key={`${item.meta.fileName}-${item.meta.createdAt}-${index}`}
          item={item}
          index={index}
        />
      ))}
    </div>
  )
}
