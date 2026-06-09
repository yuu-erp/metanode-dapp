export {}
declare global {
  type BCEvents = {
    ChunkUploaded: { fileKey: any; chunkIndex: any }
    FileAdded: { fileKey: any; name: any; contentLen: any }
    FileDeleted: { fileKey: any }
    FileLocked: { fileKey: any }
  }
}
