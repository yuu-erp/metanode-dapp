import { useConnectWallet } from '@/hooks/useConnectWallet'
import { memo } from 'react'
import { Button } from '../ui/button'

export type ConnectWalletProps = {}

export const ConnectWallet = memo(({}: ConnectWalletProps) => {
  const { mutate, isPending } = useConnectWallet()

  return (
    <Button onClick={() => mutate()} loading={isPending}>
      Connect
    </Button>
  )
})
