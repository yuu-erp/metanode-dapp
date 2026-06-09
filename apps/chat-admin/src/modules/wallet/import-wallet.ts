import { createWalletFromPrivateKey } from '@metanodejs/system-core'
import { useMutation } from '@tanstack/react-query'
import { refetchAllWallets } from './all-wallets'
import { normalizeAddress } from '@/lib'

export async function importWalletWithPrivateKey(_privateKey: string, name: string) {
  const privateKey = normalizeAddress(_privateKey)
  if (privateKey.length !== 64) throw new Error('Invalid private key length')
  if (!name) throw new Error('Name is required')
  await createWalletFromPrivateKey({
    privateKey,
    name,
    backgroundImage: ''
  })

  refetchAllWallets()
}

export function useImportWalletWithPrivateKey(
  privateKey: string,
  name: string,
  onSuccess?: () => void
) {
  return useMutation({
    mutationFn: () => importWalletWithPrivateKey(privateKey, name),
    onSuccess: () => {
      onSuccess?.()
    }
  })
}
