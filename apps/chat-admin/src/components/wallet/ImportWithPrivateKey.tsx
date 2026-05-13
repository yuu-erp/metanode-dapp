import { useImportWalletWithPrivateKey } from '@/modules/wallet/import-wallet'
import { memo, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ErrorText } from '../ui/ErrorText'

export type ImportWithPrivateKeyProps = {
  closeDialog?: () => void
}

export const ImportWithPrivateKey = memo(({ closeDialog }: ImportWithPrivateKeyProps) => {
  const [privateKey, setPrivateKey] = useState('')
  const [name, setName] = useState('')
  const { mutate, isPending, error } = useImportWalletWithPrivateKey(privateKey, name, closeDialog)

  return (
    <>
      <Input onInputChange={setName} placeholder="Enter your name..." />
      <Input onInputChange={setPrivateKey} placeholder="Enter your private key..." hasPaste />
      <ErrorText error={error} />
      <Button className="border-app" onClick={() => mutate()} loading={isPending}>
        Import
      </Button>
    </>
  )
})
