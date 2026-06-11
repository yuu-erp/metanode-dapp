import { usePlatform } from '@/hooks/core/use-platform'
import { fileToFileItem } from '@/new/file/file.utils'
import { base64ToFile, normalizePath } from '@/shared/lib'
import { fileActions, type FileItem, type FileMeta } from '@/stores/file.store'
import { sendCommand } from '@metanodejs/system-core'
import { Paperclip } from 'lucide-react'
import { memo, useRef, useState, type ChangeEvent } from 'react'

export type SelectFileButtonProps = {}

export const SelectFileButton = memo(({}: SelectFileButtonProps) => {
  const [open, setOpen] = useState(false)
  const { isNotWeb } = usePlatform()
  const inputRef = useRef<HTMLInputElement>(null)
  const close = () => setOpen(false)

  const metaToFile = async (meta: FileMeta) => {
    const path = normalizePath(meta.path)
    const { base64 } = await sendCommand('getBase64FromPath', { path })
    return base64ToFile(base64, meta.fileName, meta.mimeType)
  }

  const onClickButton = () => {
    if (isNotWeb) {
      setOpen(!open)
    } else {
      inputRef.current?.click()
    }
  }

  const selectImage = async () => {
    close()
    const meta = await sendCommand('select-image')
    const file = await metaToFile(meta)
    fileActions.addItem({ file, meta: { ...meta, ...meta?.metadata } })
  }

  const selectFile = async () => {
    close()
    const meta = await sendCommand('get-file')
    const file = await metaToFile(meta)
    fileActions.addItem({ file, meta: { ...meta, ...meta?.metadata } })
  }

  const takePicture = async () => {
    close()
    const meta = await sendCommand('take-picture')
    const file = await metaToFile(meta)
    fileActions.addItem({ file, meta: { ...meta, ...meta?.metadata } })
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]

    const items: FileItem[] = files.map((file) => fileToFileItem(file))
    e.target.value = ''
    if (!items.length) return
    fileActions.addItem(items)
  }

  return (
    <>
      <button
        className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
        onClick={onClickButton}
      >
        <Paperclip className="text-white/80" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 text-foreground">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={close} />

          {/* popover */}
          <div className="absolute bottom-20 left-5 bg-white rounded-2xl p-4 min-w-[200px]">
            <div className="flex flex-col gap-2 items-start">
              <button onClick={selectImage}>Chọn ảnh</button>
              <button onClick={selectFile}>Chọn file</button>
              <button onClick={takePicture}>Mở camera / media</button>
            </div>
          </div>
        </div>
      )}
      <input multiple ref={inputRef} className="hidden" type="file" onChange={onFileChange} />
    </>
  )
})
