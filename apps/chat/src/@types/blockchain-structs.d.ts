export {}
declare global {
  type BCDownloadSession = { fileKey: any; user: any; confirmations: any[]; isConfirmed: boolean }
  type BCInfo = {
    owner: any
    merkleRoot: any
    contentLen: any
    totalChunks: any
    expireTime: any
    name: any
    ext: any
    contentDisposition: any
    contentID: any
    status: any
  }
  type BCFileProgress = { lastChunkHash: any; processedChunks: any; processedLength: any }
}
