export interface FileCache {
  id: string // fileKey
  blob: Blob
  mimeType: string
  fileName: string
  filePath?: string
  timestamp: number
}
