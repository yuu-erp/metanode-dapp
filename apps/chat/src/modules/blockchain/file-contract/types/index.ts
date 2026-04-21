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

export interface UploadChunksParams {
  fileKey: string
  chunkDatas: string[]
  chunkHashes: string[]
}

export interface GetFileKeyFromNameParams {
  names: string[]
}

export interface GetFilesInfoParams {
  fileKeys: string[]
}

export interface DownloadFileParams {
  fileKey: string
  start: number
  limit: number
}
