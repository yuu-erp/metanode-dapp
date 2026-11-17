export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExt(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')

  if (lastDot === -1 || lastDot === fileName.length - 1) {
    return ''
  }

  return fileName.slice(lastDot + 1)
}

const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
}

/** Contract thường trả ext; optimistic có mime đầy đủ. */
export function resolveContentMimeType(mimeOrExt: string, fileName?: string): string {
  const raw = mimeOrExt?.trim() ?? ''
  if (raw.includes('/')) return raw

  const fromField = EXT_TO_MIME[raw.toLowerCase()]
  if (fromField) return fromField

  const fromName = fileName ? getFileExt(fileName).toLowerCase() : ''
  return EXT_TO_MIME[fromName] ?? (raw ? `application/${raw}` : 'application/octet-stream')
}

export function resolvePreviewType(meta?: {
  mimeType?: string
  extension?: string
  fileName?: string
}): 'image' | 'video' | '' {
  const mime = resolveContentMimeType(meta?.mimeType ?? meta?.extension ?? '', meta?.fileName)
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return ''
}
