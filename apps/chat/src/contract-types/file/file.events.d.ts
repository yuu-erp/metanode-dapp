export type FileEvents = {
  ChunkUploaded: { fileKey: string; chunkIndex: number }
  DownloadKeyConfirmed: { downloadKey: string; fileKey: string }
  DownloadKeyGenerated: { downloadKey: string; fileKey: string; user: string; amount: number }
  FileActivated: { user: string; fileKey: string }
  FileAdded: { fileKey: string; name: string; contentLen: number }
  FileDeleted: { fileKey: string }
  FileLocked: { fileKey: string }
  FundsWithdrawn: { owner: string; amount: number }
  Initialized: { version: number }
  PaymentReceived: { fileKey: string; payer: string; amount: number; downloadCount: number }
  StorageConfirmed: { downloadKey: string; storageServer: string; currentConfirmations: number }
  Upgraded: { implementation: string }
}
