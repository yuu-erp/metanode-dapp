import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Copy, FolderSync } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../../ui/button'

export type TransferAdminProps = {}

export const TransferAdmin = memo(({}: TransferAdminProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <FolderSync />
          Transfer Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Transfer as Admin</DialogTitle>
        <Input
          rightNode={<Copy className="siez-4" />}
          placeholder="Paste your wallet want to transfer here"
        />
        <Button className="" variant={'secondary'}>
          Transfer
        </Button>
      </DialogContent>
    </Dialog>
  )
})
