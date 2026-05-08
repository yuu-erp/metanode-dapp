import { memo } from 'react'
import { Button } from '../ui/button'

export type WalletButtonsProps = {}

export const WalletButtons = memo(({}: WalletButtonsProps) => {
  return (
    <div className="flex">
      <Button>Connect</Button>
    </div>
  )
})
