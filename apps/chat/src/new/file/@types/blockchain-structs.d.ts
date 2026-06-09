export {}
declare global {
  type BCInfo = {
    owner: any
    hash: any
    contentLen: any
    totalChunks: any
    expireTime: any
    name: any
    ext: any
    status: any
    contentDisposition: any
    contentID: any
  }
  type BCFileProgress = {
    lastChunkHash: any
    processedChunks: any
    processedLength: any
  }
}
