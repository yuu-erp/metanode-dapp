import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { onFileInputChange, onGetNativeFile } from 'file-core'
import { Paperclip } from 'lucide-react'
import { memo, useRef, useState } from 'react'
import { PopoverItem } from './popover-item'

export type SelectFileButtonProps = {}

export const SelectFileButton = memo(({}: SelectFileButtonProps) => {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputRef2 = useRef<HTMLInputElement>(null)

  const close = () => setOpen(false)

  const onClickButton = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(!open)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            className="size-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80"
            onClick={onClickButton}
          >
            <Paperclip className="text-white/80" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="bg-black/30 border-0 text-white backdrop-blur-md-app w-[200px]"
        >
          <div className="rounded-2xl text-sm">
            <div className="flex flex-col items-start">
              <PopoverItem
                onClick={() => {
                  close()

                  if (window.fiaiSDK) {
                    inputRef2.current?.click()
                  } else {
                    onGetNativeFile('select-image')
                  }
                }}
              >
                Chọn ảnh
              </PopoverItem>
              <PopoverItem
                onClick={() => {
                  close()
                  if (window.fiaiSDK) {
                    inputRef.current?.click()
                  } else {
                    onGetNativeFile('get-file')
                  }
                }}
              >
                Chọn file
              </PopoverItem>
              {!window.fiaiSDK && (
                <PopoverItem
                  onClick={() => {
                    close()
                    onGetNativeFile('take-picture')
                  }}
                >
                  Mở camera / media
                </PopoverItem>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

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
      <input
        multiple
        ref={inputRef2}
        className="hidden"
        accept="image/*,video/*"
        type="file"
        onChange={onFileInputChange}
        onClick={(e) => {
          ;(e.currentTarget as HTMLInputElement).value = ''
        }}
      />
    </>
  )
})
