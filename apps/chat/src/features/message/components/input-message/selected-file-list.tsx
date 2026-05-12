'use client'

import { formatBytes } from '@/shared/lib'
import { FileIcon, X } from 'lucide-react'

import * as React from 'react'

export interface SelectedFileListProps {
  files: File[]
  onRemove: (index: number) => void
  fileData: any[]
  removeFileData: (index: number) => void
}

function FileItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!file.type.startsWith('image/')) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 group">
      <div className="flex items-center justify-center size-12 rounded-xl bg-white/10 shrink-0 overflow-hidden">
        {preview ? (
          <img src={preview} alt={file.name} className="size-full object-cover" />
        ) : (
          <FileIcon className="size-4 text-white/80" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-sm font-medium text-white/90 truncate">{file.name}</p>
        <p className="text-xs text-white/50">{formatBytes(file.size)}</p>
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

export function SelectedFileList({
  files,
  onRemove,
  fileData,
  removeFileData
}: SelectedFileListProps) {
  console.log({ fileData })
  if (!files.length && !fileData.length) return null
  return (
    <div className="flex flex-col gap-1 w-full mb-2 max-h-40 overflow-y-auto no-scrollbar custom-scrollbar pt-2">
      {files.map((file, index) => (
        <FileItem key={`${file.name}-${index}`} file={file} onRemove={() => onRemove(index)} />
      ))}
      {fileData.map((item, index) => (
        <FileDataItem key={item.path} fileData={item} onRemove={() => removeFileData(index)} />
      ))}
    </div>
  )
}

const FileDataItem = ({ fileData, onRemove }: { fileData: any; onRemove: () => any }) => {
  const preview = fileData.path?.startsWith('image://img.m.pro')
  const { path = '', fileName = '', size = 0 } = fileData
  console.log('thanhduy - file data item', { fileData })
  return (
    <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 group">
      <div className="flex items-center justify-center size-12 rounded-xl bg-white/10 shrink-0 overflow-hidden">
        {preview ? (
          <img src={path} alt={'image'} className="size-full object-cover" />
        ) : (
          <FileIcon className="size-4 text-white/80" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {!!fileName && <p className="text-sm font -medium text-white/90 truncate">{fileName}</p>}
        {!!size && <p className="text-xs text-white/50">{formatBytes(+size)}</p>}
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
