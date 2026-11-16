import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { Paperclip } from 'lucide-react'
import { memo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { PopoverItem } from './popover-item'

export type SelectFileButtonProps = {
  onSelectFiles?: (files: File[]) => void
  onSelectImages?: (files: File[]) => void
}

export const SelectFileButton = memo(({ onSelectFiles, onSelectImages }: SelectFileButtonProps) => {
  const [open, setOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const close = () => setOpen(false)

  const handleSelect = (e: ChangeEvent<HTMLInputElement>, callback?: (files: File[]) => void) => {
    const files = Array.from(e.target.files ?? [])

    if (files.length > 0) {
      callback?.(files)
    }

    // Cho phép chọn lại cùng file
    e.target.value = ''
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
    close()
  }

  const openImagePicker = () => {
    imageInputRef.current?.click()
    close()
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="size-12 rounded-full flex items-center justify-center backdrop-blur-2xl transition-transform duration-150 active:scale-80 btn"
          >
            <Paperclip />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="border-0 text-white backdrop-blur-md-app w-[200px] bg-modal text-myapp"
        >
          <div className="rounded-2xl text-sm">
            <div className="flex flex-col items-start">
              <PopoverItem onClick={openImagePicker}>Chọn ảnh</PopoverItem>

              <PopoverItem onClick={openFilePicker}>Chọn file</PopoverItem>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleSelect(e, onSelectImages)}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleSelect(e, onSelectFiles)}
      />
    </>
  )
})

SelectFileButton.displayName = 'SelectFileButton'
