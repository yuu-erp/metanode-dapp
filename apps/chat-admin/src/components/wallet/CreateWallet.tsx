import { memo } from 'react'
import { Button } from '../ui/button'
import { handleCreateWallet } from '@/modules/wallet/create-wallet'

export type CreateWalletProps = {}

export const CreateWallet = memo(({}: CreateWalletProps) => {
  return <Button onClick={handleCreateWallet}>Create Wallet</Button>
})
