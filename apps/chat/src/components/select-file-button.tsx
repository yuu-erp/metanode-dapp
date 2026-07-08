import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useGetFile } from 'file-core'
import { Paperclip } from 'lucide-react'
import { memo, useState } from 'react'
import { PopoverItem } from './popover-item'

export type SelectFileButtonProps = {}

export const SelectFileButton = memo(({}: SelectFileButtonProps) => {
  const [open, setOpen] = useState(false)
  const { getFile, getGallery, takePicture, fileBind, galleryBind } = useGetFile()
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
                  getGallery()
                }}
              >
                Chọn ảnh
              </PopoverItem>
              <PopoverItem
                onClick={() => {
                  getFile()
                  close()
                }}
              >
                Chọn file
              </PopoverItem>
              {!window.fiaiSDK && (
                <PopoverItem
                  onClick={() => {
                    takePicture()
                    close()
                  }}
                >
                  Mở camera / media
                </PopoverItem>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <input {...fileBind} />
      <input {...galleryBind} />
    </>
  )
})
