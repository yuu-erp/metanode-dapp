export interface PushFileInfosParams {
  infos: {
    owner: string
    hash: string
    contentLen: number
    totalChunks: number
    expireTime: number
    name: string
    ext: string
    status: number
    contentDisposition: string
    contentID: string
  }[]
}
