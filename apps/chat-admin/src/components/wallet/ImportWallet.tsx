import { memo, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Button } from '../ui/button'
import { ImportWithPrivateKey } from './ImportWithPrivateKey'

export type ImportWalletProps = {}

export const ImportWallet = memo(({}: ImportWalletProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button>Import Wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Import Wallet</DialogTitle>
        <p>Private key</p>
        <ImportWithPrivateKey closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
})
