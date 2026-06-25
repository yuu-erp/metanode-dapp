import { type Dispatch, memo, type SetStateAction, useCallback, useState } from 'react'
import { toast } from 'sonner'
import ButtonBottom from './component/ButtonBottom'
import Container from './component/Container'
import Input from './component/Input'
import ModalSuccess from './component/ModalSuccess'
import UploadQR from './component/UploadQR'
import { useLoginModalStore } from '@/shared/stores/login-modal.store'
import { useGetAllWallets } from '../../hooks'
import { createWalletFromPrivateKey } from '@metanodejs/system-core'

interface ImportPrivateKeyProps {
  onBack: () => void
  onCloseModal: () => void
  onNext: (address: string) => void
  setIsLoading: Dispatch<SetStateAction<boolean>>
}

const ImportPrivateKey = memo(({ onBack, onCloseModal, setIsLoading }: ImportPrivateKeyProps) => {
  const [priKey, setPriKey] = useState<string>('')
  const [imageToShow, setImageToShow] = useState<string>('')
  const [modalSuccess, setModalSuccess] = useState<boolean>(false)

  const { onClose } = useLoginModalStore()
  const { refetch } = useGetAllWallets()

  const handleImportPK = useCallback(async () => {
    setIsLoading(true)
    if (!priKey && !imageToShow) {
      toast.error('Enter or upload qr')
      setIsLoading(false)
      return
    }

    const trimmedKey = priKey?.trim()
    const isValidPrivateKey = /^(0x)?[a-fA-F0-9]{64}$/.test(trimmedKey || '')
    console.log('[debug] - isValidPrivateKey', { isValidPrivateKey })
    if (!isValidPrivateKey) {
      toast.error('Invalid private key')
      setIsLoading(false)
      return
    }

    try {
      const res: any = await createWalletFromPrivateKey({
        privateKey: trimmedKey,
        name: `wallet_${Date.now()}`,
        backgroundImage: ''
      })

      console.log('REP IMPORT WALLET WITH PRIVATE KEY ----- ', res)
      await refetch()
      onClose()
    } catch (err) {
      console.error('create wallet failed: ', err)
      toast.error('Create wallet faile')
    }

    setIsLoading(false)
  }, [priKey, imageToShow])

  return (
    <>
      <Container className="wrapper-content flex flex-col gap-3 overflow-y-auto text-[1.25rem]/[1.5rem] text-white">
        <span className="font-customSemiBold text-[1.25rem]/[1.5rem]">Import with Private Key</span>
        <Input
          placeholder="Enter your private key"
          value={priKey}
          onInputChange={(e) => {
            setPriKey(e.target.value)
            setImageToShow('')
          }}
        />

        <UploadQR imageToShow={imageToShow} setImageToShow={setImageToShow} setPriKey={setPriKey} />
      </Container>

      <ButtonBottom
        title="Confirm"
        className="pt-5"
        onBack={() => onBack()}
        onNext={handleImportPK}
      />

      {modalSuccess && (
        <ModalSuccess
          isImport
          onClose={() => {
            onBack()
            setPriKey('')
            setImageToShow('')
            setModalSuccess(false)
            onCloseModal()
          }}
        />
      )}
    </>
  )
})

export default ImportPrivateKey
