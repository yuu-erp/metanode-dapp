import { formatFileSize, getFileExt } from '@/new'
import type { FileItem } from '@/stores/file.store'

export function filesToFileItems(files: File[]): FileItem[] {
  return files.map((file) => {
    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : ''

    return {
      file,
      path: previewUrl || undefined,
      meta: {
        path: previewUrl,
        fileName: file.name,
        extension: getFileExt(file.name),
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        createdAt: Date.now(),
        displaySize: formatFileSize(file.size),
      },
    }
  })
}
