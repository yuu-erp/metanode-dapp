import { memo } from 'react'
import { Button } from '../ui/button'
import { Wallet } from 'lucide-react'
import { walletActions } from '@/modules/wallet/wallet.store'
import { useNavigate } from '@tanstack/react-router'

export type ChooseWalletProps = {}

export const ChooseWallet = memo(({}: ChooseWalletProps) => {
  const navigate = useNavigate()

  return (
    <Button
      variant={'secondary'}
      className="rounded-full"
      onClick={() => {
        walletActions.reset()
        navigate({ to: '/set-wallet' })
      }}
    >
      Choose Wallet
      <Wallet />
    </Button>
  )
})
