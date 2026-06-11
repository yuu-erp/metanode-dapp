export {}
declare global {
  type BCEvents = {
    ChunkUploaded: { fileKey: any; chunkIndex: any }
    DownloadKeyConfirmed: { downloadKey: any; fileKey: any }
    DownloadKeyGenerated: { downloadKey: any; fileKey: any; user: any; amount: any }
    FileActivated: { user: any; fileKey: any }
    FileAdded: { fileKey: any; name: any; contentLen: any }
    FileDeleted: { fileKey: any }
    FileLocked: { fileKey: any }
    FundsWithdrawn: { owner: any; amount: any }
    Initialized: { version: any }
    PaymentReceived: { fileKey: any; payer: any; amount: any; downloadCount: any }
    StorageConfirmed: { downloadKey: any; storageServer: any; currentConfirmations: any }
    Upgraded: { implementation: any }
  }
}
