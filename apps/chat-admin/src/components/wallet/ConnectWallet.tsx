import { walletActions } from '@/modules/wallet/wallet.store'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { Button } from '../ui/button'

export type ConnectWalletProps = {}

export const ConnectWallet = memo(({}: ConnectWalletProps) => {
  const navigate = useNavigate()

  return (
    <Button
      onClick={() => {
        walletActions.commitCurrentToPersisted()
        navigate({ to: '/' })
      }}
    >
      Connect
    </Button>
  )
})
