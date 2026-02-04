export interface FileCache {
  id: string // fileKey
  base64: string
  mimeType: string
  fileName: string
  timestamp: number
}
