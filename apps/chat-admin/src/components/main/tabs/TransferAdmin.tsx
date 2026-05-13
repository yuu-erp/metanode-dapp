import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ErrorText } from '@/components/ui/ErrorText'
import { Input } from '@/components/ui/input'
import { useTransferOwner } from '@/modules/chat-admin/transfer-owner'
import { FolderSync } from 'lucide-react'
import { memo, useState } from 'react'
import { Button } from '../../ui/button'

export type TransferAdminProps = {}

export const TransferAdmin = memo(({}: TransferAdminProps) => {
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState('')
  const { mutate, isPending, error } = useTransferOwner(address)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FolderSync />
          Transfer Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Transfer as Admin</DialogTitle>
        <Input
          hasPaste
          placeholder="Paste your wallet want to transfer here"
          onInputChange={setAddress}
        />
        <Button className="" variant={'secondary'} onClick={() => mutate()} loading={isPending}>
          Transfer
        </Button>
        <ErrorText error={error} />
      </DialogContent>
    </Dialog>
  )
})
