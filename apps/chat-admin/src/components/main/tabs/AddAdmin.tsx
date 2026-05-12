import { memo } from 'react'
import { Button } from '../../ui/button'
import { Copy, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export type AddAdminProps = {}

export const AddAdmin = memo(({}: AddAdminProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add as Admin</DialogTitle>
        <Input
          rightNode={<Copy className="siez-4" />}
          placeholder="Paste your wallet want to add here"
        />
        <Button className="" variant={'secondary'}>
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
})
