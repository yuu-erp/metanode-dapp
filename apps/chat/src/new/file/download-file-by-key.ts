import { getCurrentAccount } from '@/shared/hooks'
import { appConfig, createFileModule } from '@metanodejs/file-module'

/**
 * Tải nội dung file từ fileKey on-chain.
 * TODO: implement — caller nhận bytes ghép đầy đủ file.
 */
export async function downloadFileBytesByKey(_fileKey: string): Promise<Uint8Array> {
  try {
    console.log('downloadFileBytesByKey 1')
    const modules = createFileModule()
    const account = await getCurrentAccount()
    await modules.initialize(account.hiddenAddress, appConfig.file)
    const downloadUseCase = modules.getDownloadFileUseCase()
    const results = await downloadUseCase.execute({
      fileKey: _fileKey,
      from: account.hiddenAddress,
      downloadTimes: 1,
      wt: true,
    })

    return results.fileData! as any
  } catch (error) {
    console.log('downloadFileBytesByKey error', error)
    throw error
  }
  // throw new Error('downloadFileBytesByKey: not implemented')
}
