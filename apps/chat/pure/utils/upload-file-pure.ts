import type { Account } from '@/modules/account'
import { appConfig, createFileModule } from '@metanodejs/file-module'

/** Giống `readlIds` trong `upload-files-for-send.ts` — upload + set public. */
export async function uploadFileForPureSend(account: Account, file: File): Promise<string> {
  if (!(file instanceof File) || !file.size) {
    throw new Error('Chọn file hợp lệ')
  }

  const modules = createFileModule()
  await modules.initialize(account.hiddenAddress, appConfig.file)
  const uploadUseCase = modules.getUploadFileUseCase()
  const setPublicStatusUseCase = modules.getSetPublicStatusUseCase()

  const results = await uploadUseCase.execute({
    file,
    from: account.hiddenAddress,
    chunkSize: 1024 * 1024,
  })

  await setPublicStatusUseCase.execute({
    fileKey: results.fileKey,
    from: account.hiddenAddress,
    status: true,
  })

  return results.fileKey
}
