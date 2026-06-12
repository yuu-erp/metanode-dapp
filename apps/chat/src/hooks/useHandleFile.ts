import { useCallback } from 'react'
import { createFileModule } from '@metanodejs/file-module'
import { CONTRACT_ADDRESSES } from '@/config'

const FILE_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.file || '087cdab97d38a3bfFcDee170739E8C11Af651569'

export interface HandlePushFilesOptions {
  maxBytes?: number
}

export const useHandleFile = () => {
  const handlePushFiles = useCallback(
    async (from: string, files: File[], options?: HandlePushFilesOptions) => {
      console.log('[useHandleFile] handlePushFiles triggered', {
        from,
        filesCount: files.length,
        files: files.map((f) => ({ name: f.name, size: f.size })),
        options
      })
      try {
        console.log('[useHandleFile] 1')
        const fileModule = createFileModule(undefined, {
          userAddress: from,
          contractAddress: FILE_CONTRACT_ADDRESS
        })

        await fileModule.initialize(from, FILE_CONTRACT_ADDRESS)
        console.log('[useHandleFile] 2')

        const uploadUseCase = fileModule.getUploadFileUseCase()
        console.log('[useHandleFile] 3')

        const results = []

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          console.log(
            `[useHandleFile] starting upload for file: ${file.name} (${i + 1}/${files.length})`
          )

          const result = await uploadUseCase.execute({
            file: file as File,
            from: from,
            chunkSize: 1024 * 250
          })

          if (!result || !result.fileKey) {
            throw new Error(`Upload failed for ${file.name}: No fileKey returned`)
          }

          console.log(`[useHandleFile] upload successful for file: ${file.name}`, result)
          //@ts-ignore
          results.push(result.fileKey)
        }

        console.log('[useHandleFile] handlePushFiles completed successfully', results)
        return results
      } catch (error: any) {
        console.error('[useHandleFile] [HANDLE PUSH FILE ERROR]', error)
        throw error
      }
    },
    []
  )

  const handleGetFiles = useCallback(async (from: string, fileKeys: string[]) => {
    try {
      console.log('handleGetFiles 1', { from, fileKeys })
      const fileModule = createFileModule(undefined, {
        userAddress: from,
        contractAddress: FILE_CONTRACT_ADDRESS
      })
      await fileModule.initialize(from, FILE_CONTRACT_ADDRESS)
      console.log('handleGetFiles 2')

      const downloadUseCase = fileModule.getDownloadFileUseCase()
      console.log('handleGetFiles 3')

      const finalResults = await Promise.all(
        fileKeys.map(async (fileKey) => {
          // Bỏ qua các URL thông thường
          console.log('thanhduy - test down load file 1', { fileKey })
          if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
            return { url: fileKey, ext: '' }
          }
          fileKey.startsWith('0x') ? (fileKey = fileKey.slice(2)) : fileKey
          // Chỉ xử lý hex 64 ký tự (fileKey hợp lệ)
          const isHex = /^[0-9a-fA-F]+$/.test(fileKey)
          const isCorrectLength = fileKey.length === 64
          console.log('thanhduy - test down load file 2', { isHex, isCorrectLength, fileKey })

          if (!isHex || !isCorrectLength) {
            return { url: fileKey, ext: '' }
          }
          try {
            console.log(`[useHandleFile] Downloading file: ${fileKey}`)

            const result = await downloadUseCase.execute({
              fileKey,
              from,
              downloadTimes: 1
            })

            const ext = result.fileExt?.toLowerCase() || ''
            let mimeType = 'image/png'
            if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg'
            else if (ext === 'webp') mimeType = 'image/webp'
            else if (ext === 'mp4' || ext === 'mov') mimeType = 'video/mp4'
            else if (ext === 'pdf') mimeType = 'application/pdf'
            else if (ext === 'json') mimeType = 'application/json'
            else if (ext === 'csv') mimeType = 'text/csv'
            else if (ext === 'xlsx' || ext === 'xls')
              mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            else if (ext === 'doc' || ext === 'docx')
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

            const blob = new Blob([result.fileData], { type: mimeType })

            // Trả về object URL để dùng trong <img src> hoặc download
            const objectUrl = URL.createObjectURL(blob)
            console.log(
              `[useHandleFile] Download OK: ${fileKey} -> ${result.fileData.byteLength} bytes`
            )
            return { url: objectUrl, ext, blob }
          } catch (err) {
            console.error(`[useHandleFile] Error downloading file ${fileKey}:`, err)
            return { url: fileKey, ext: '' }
          }
        })
      )
      console.log('handleGetFiles 4')

      return finalResults
    } catch (error: any) {
      console.error('[useHandleFile] [HANDLE GET FILE ERROR]', error)
      throw error
    }
  }, [])

  return {
    handlePushFiles,
    handleGetFiles
  }
}
