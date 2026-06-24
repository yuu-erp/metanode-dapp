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
