export {}
declare global {
  type BCMethods = { file: BCFileMethods }

  type BCFileMethods = {
    deleteFile: [{ fileKey: any }, void]
    downloadFile: [{ fileKey: any; start: any; limit: any }, unknown[]]
    getFileInfo: [{ fileKey: any }, BCInfo]
    getFileKeyFromName: [{ names: any[] }, any[]]
    getFileProgress: [{ fileKey: any }, BCFileProgress]
    getFilesInfo: [{ fileKeys: any[] }, { infos: BCInfo[] }]
    lockFile: [{ fileKey: any }, void]
    mKeyToFileInfo: [{ '': any }, { info: BCInfo; progress: BCFileProgress }]
    mNameToFileKey: [{ '': any }, any]
    owner: [undefined, any]
    pushFileInfo: [{ info: BCInfo }, { fileKey: any }]
    pushFileInfos: [{ infos: BCInfo[] }, any[]]
    renewTime: [{ fileKey: any; _newExpireTime: any }, void]
    service: [undefined, any]
    setService: [{ _service: any }, void]
    uploadChunk: [{ fileKey: any; chunkData: unknown; chunkHash: any }, void]
    uploadChunks: [{ fileKey: any; chunkDatas: unknown[]; chunkHashes: any[] }, void]
  }
}
