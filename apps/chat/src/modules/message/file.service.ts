import { downloadFile } from '@/shared/lib'
import { createFileWithBuffer } from '@metanodejs/system-core'

export async function createPathFromBlob(
  blob: Blob,
  fileName: string,
  isSave = true
): Promise<string> {
  console.log('[createPathFromBlob]', isSave)
  const arrayBuffer = await blob.arrayBuffer()

  const dotIndex = fileName.lastIndexOf('.')
  const name = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex + 1) : ''

  const buffer = Array.from(new Uint8Array(arrayBuffer))

  if (window?.finSdk && isSave) {
    return downloadFile({ name, ext, buffer })
  }

  const result = await createFileWithBuffer(name, 'message', ext, buffer)
  return result?.path
}
