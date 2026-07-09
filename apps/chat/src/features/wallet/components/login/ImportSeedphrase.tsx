import { cn } from '@/shared/lib'
import { useLoginModalStore } from '@/shared/stores/login-modal.store'
import { convertStringToSeedPhrase } from '@/shared/utils/createwallet'
import { createWallet, getFromClipboard } from '@metanodejs/system-core'
import { Copy } from 'lucide-react'
import React, { type Dispatch, memo, type SetStateAction, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useGetAllWallets } from '../../hooks'
import ButtonBottom from './component/ButtonBottom'
import Container from './component/Container'
import ModalSuccess from './component/ModalSuccess'
import UploadQR from './component/UploadQR'

interface ImportSeedphraseProps {
  onBack: () => void
  onCloseModal: () => void
  onNext: (address: string) => void
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const ImportSeedphrase = memo(({ onBack, setIsLoading, onCloseModal }: ImportSeedphraseProps) => {
  const [modalSuccess, setModalSuccess] = useState<boolean>(false)
  const [errorInput, setErrorInput] = useState<string>('')
  const [imageToShow, setImageToShow] = useState<string>('')
  const [customSeedphrase, setCustomSeedphrase] = useState<string>('')
  const [duplicateError, setDuplicateError] = useState<string>('')

  const { refetch } = useGetAllWallets()
  const { onClose } = useLoginModalStore()

  const handleOnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.includes('Mx3S5')) {
      handleSet(value)
    } else {
      setCustomSeedphrase(value)
    }

    const words =
      value.split('\n').length === 1
        ? value.split(' ').filter((word) => word.trim() !== '')
        : value.split('\n').filter((word) => word.trim() !== '')
    const duplicates = words.filter((word, index) => words.indexOf(word) !== index)

    if (value !== '' && words.length !== 24) {
      setErrorInput('noti.seed.not-enough-24')
    } else {
      setErrorInput('')
    }

    if (duplicates.length > 0) {
      setErrorInput('noti.seed.duplicate-seed')
    } else {
      setErrorInput('')
    }
  }, [])

  const handleSet = (string: string) => {
    const textConvert = string.startsWith('Mx3S5')
      ? convertStringToSeedPhrase(string)
      : String(string).split('\r\n')
    const duplicates = textConvert.filter((word, index) => textConvert.indexOf(word) !== index)
    setCustomSeedphrase(textConvert.join(' '))
    if (duplicates.length > 0) {
      setErrorInput('Duplicate seed')
    } else {
      setErrorInput('')
    }
  }

  const handlePaste = async () => {
    const string = window.fiaiSDK ? await navigator.clipboard.readText() : await getFromClipboard()
    handleSet(string)
  }

  const handleSubmitSP = useCallback(async () => {
    setIsLoading(true)
    if (!customSeedphrase && !imageToShow) {
      toast.error('Enter or upload qr')
    } else {
      const seedPhrases =
        customSeedphrase.split('\n').length === 1
          ? customSeedphrase.split(' ').filter((word) => word.trim() !== '')
          : customSeedphrase.split('\n').filter((word) => word.trim() !== '')

      if (seedPhrases.length === 24 && !duplicateError) {
        await createWallet({
          seed: customSeedphrase.split(' '),
          name: `wallet_${Date.now()}`,
          backgroundImage: ''
        })
        await refetch()
        onClose()
      } else {
        toast.error('Invalid qr seed')
      }
    }
    setIsLoading(false)
  }, [customSeedphrase, imageToShow, duplicateError])

  return (
    <>
      <Container className="wrapper-content flex flex-col gap-3 overflow-y-auto text-[1.25rem]/[1.5rem]">
        <span className="mb-2 font-customSemiBold text-[1.25rem]/[27.3px]">
          Create with Seed Phrase!
        </span>
        <div className="max-h-[350px] min-h-[250px]">
          <div
            className={cn(errorInput ? 'h-[87%]' : 'h-[100%]', 'relative rounded-2xl bg-white p-3')}
          >
            <textarea
              className="scroll-bar-small h-full w-full text-[1rem] bg-transparent border-none outline-none"
              placeholder="Enter 24 seed phrase"
              value={customSeedphrase}
              onChange={handleOnChange}
            />
            {customSeedphrase === '' && (
              <Copy className="absolute right-2 top-2 h-6 w-6" onClick={handlePaste} />
            )}
          </div>
          {errorInput && (
            <div className="mt-1 h-[18px] px-1 text-[0.8rem]/[18px] text-red-500">{errorInput}</div>
          )}
        </div>
        <UploadQR
          imageToShow={imageToShow}
          setImageToShow={setImageToShow}
          setCustomSeedphrase={setCustomSeedphrase}
          setErrorInput={setErrorInput}
        />
      </Container>

      <ButtonBottom
        title="Confirm"
        onBack={() => {
          onBack()
          setCustomSeedphrase('')
          setImageToShow('')
          setErrorInput('')
          setDuplicateError('')
        }}
        onNext={handleSubmitSP}
        className="pt-5"
      />

      {/* {prikey !== '' && (
        <div className="opacity-0">
          <QRCode ref={qrRef} size={188} value={prikey} viewBox={`0 0 188 188`} />
        </div>
      )} */}

      {modalSuccess && (
        <ModalSuccess
          isImport
          onClose={() => {
            onBack()
            setImageToShow('')
            setCustomSeedphrase('')
            setErrorInput('')
            setDuplicateError('')
            setModalSuccess(false)
            onCloseModal()
          }}
        />
      )}
    </>
  )
})

export default ImportSeedphrase
