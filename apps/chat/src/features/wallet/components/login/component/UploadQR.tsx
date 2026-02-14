import { ImageUp } from 'lucide-react'
import React, { type Dispatch, memo, type SetStateAction, useCallback } from 'react'
import { toast } from 'sonner'
import jsQR from 'jsqr'
import { convertStringToSeedPhrase } from '@/shared/utils/createwallet'

type UploadQRProps = {
  hideOr?: boolean
  imageToShow: string
  setImageToShow: Dispatch<SetStateAction<string>>
  setCustomSeedphrase?: Dispatch<SetStateAction<string>>
  setPriKey?: Dispatch<SetStateAction<string>>
  setErrorInput?: Dispatch<SetStateAction<string>>
}

const UploadQR = memo(
  ({
    hideOr,
    imageToShow,
    setImageToShow,
    setCustomSeedphrase,
    setPriKey,
    setErrorInput
  }: UploadQRProps) => {
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid img')
        return
      }

      setImageToShow(URL.createObjectURL(file))
      const reader = new FileReader()
      reader.onloadend = (event) => {
        const img = new Image()
        img.onload = function () {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const context = canvas.getContext('2d')
          context?.drawImage(img, 0, 0)
          const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
          console.log('UPLOAD QR CODE IMAGE DATA ----- ', imageData)
          if (imageData) {
            const code = jsQR(imageData.data, imageData.width, imageData.height)
            console.log('UPLOAD QR CODE ----- ', code)
            if (code?.data) {
              if (setCustomSeedphrase) {
                const codeConvert = convertStringToSeedPhrase(code.data)
                const duplicates = codeConvert.filter(
                  (word, index) => codeConvert.indexOf(word) !== index
                )
                if (duplicates.length === 0 && codeConvert.length === 24) {
                  setCustomSeedphrase(codeConvert.join(' '))
                  setErrorInput && setErrorInput('')
                } else {
                  toast.error('Invalid qr seed')
                }
              } else if (setPriKey) {
                const privateKey = code.data.trim()
                const isValidHexKey = /^(0x)?[a-fA-F0-9]{64}$/.test(privateKey)
                if (isValidHexKey) {
                  setPriKey(privateKey)
                } else {
                  toast.error('Invalid qr pri')
                }
              }
            } else {
              toast.error('No qr code found')
            }
          } else {
            console.error('Failed to get image data!')
          }
        }

        if (typeof event.target?.result === 'string') {
          img.src = event.target.result
        } else {
          console.error('FileReader result is not a string')
        }
      }
      reader.readAsDataURL(file)
    }, [])

    return (
      <div className="flex h-fit w-full flex-1 flex-col items-center gap-3">
        {!hideOr && (
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-[67px] bg-white/[.6]" />
            <p className="font-customSemiBold text-[16px]/[26px] tracking-[1%]">Or</p>
            <div className="h-[1px] w-[67px] bg-white/[.6]" />
          </div>
        )}

        <div className="flex h-fit w-full flex-col items-center gap-3 rounded-[8.4px] border-[2px] border-dotted border-blackMain/[.22] p-3">
          <div className="flex min-h-[280px] p-5">
            {imageToShow ? (
              <div className="size-full rounded-lg bg-white p-2">
                <img
                  src={imageToShow}
                  alt="imageToShow"
                  className="size-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center">
                <ImageUp />
                <p className="font-customMedium text-[16px]/[27.3px] tracking-[1%]">
                  Input with QR code
                </p>
              </div>
            )}
          </div>

          <div className="flex w-full items-center gap-1 text-[14px] tracking-[1%]">
            <button className="h-[33px] w-full rounded-xl transition-all duration-150 ease-in-out hover:scale-[102%] border-app">
              Scan QR code
            </button>
            <div className="relative h-[33px] w-full transition-all duration-150 ease-in-out hover:scale-[102%]">
              <button className="size-full rounded-xl border-app">Upload image</button>
              <input
                key={imageToShow}
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default UploadQR
