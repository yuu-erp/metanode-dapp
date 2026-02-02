import { createFileWithBuffer } from '@metanodejs/system-core'

export class FileTransferService {
  /**
   * Saves a received file to the system's local storage and returns the local path.
   * @param fileName Original name of the file
   * @param buffer ArrayBuffer containing the file data
   * @returns Local path where the file was saved
   */
  async saveReceivedFile(fileName: string, buffer: ArrayBuffer): Promise<string> {
    try {
      const dotIndex = fileName.lastIndexOf('.')
      const name = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName
      const ext = dotIndex !== -1 ? fileName.substring(dotIndex + 1) : ''

      // Convert ArrayBuffer to a plain number array for the system bridge
      const uint8Array = new Uint8Array(buffer)
      const dataArray = Array.from(uint8Array)

      console.log(`[FileTransferService] Saving file: ${fileName} (${uint8Array.length} bytes)`)

      const result = await createFileWithBuffer(name, 'message', ext, dataArray)

      console.log(`[FileTransferService] File saved successfully at: ${result.path}`)
      return result.path
    } catch (error) {
      console.error('[FileTransferService] Failed to save file:', error)
      throw error
    }
  }
}
