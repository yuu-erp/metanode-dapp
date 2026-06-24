import { usePlatform } from '@/hooks/core/use-platform'
import { onGetNativeFile, onFileInputChange } from 'file-core'
import { Paperclip } from 'lucide-react'
import { memo, useRef, useState } from 'react'

export type SelectFileButtonProps = {}

export const SelectFileButton = memo(({}: SelectFileButtonProps) => {
  const [open, setOpen] = useState(false)
  const { isNotWeb } = usePlatform()
  const inputRef = useRef<HTMLInputElement>(null)
  const close = () => setOpen(false)

  const onClickButton = () => {
    if (isNotWeb) {
      setOpen(!open)
    } else {
      inputRef.current?.click()
    }
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
              <button onClick={() => onGetNativeFile('select-image')}>Chọn ảnh</button>
              <button onClick={() => onGetNativeFile('get-file')}>Chọn file</button>
              <button onClick={() => onGetNativeFile('take-picture')}>Mở camera / media</button>
            </div>
          </div>
        </div>
      )}
      <input
        multiple
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={onFileInputChange}
        onClick={(e) => {
          ;(e.currentTarget as HTMLInputElement).value = ''
        }}
      />
    </>
  )
})
