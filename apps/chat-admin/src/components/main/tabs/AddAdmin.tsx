import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ErrorText } from '@/components/ui/ErrorText'
import { Input } from '@/components/ui/input'
import { useAddAdmin } from '@/modules/chat-admin/add-admin'
import { UserPlus } from 'lucide-react'
import { memo, useState } from 'react'
import { Button } from '../../ui/button'

export type AddAdminProps = {}

export const AddAdmin = memo(({}: AddAdminProps) => {
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState('')
  const { mutate, isPending, error } = useAddAdmin(address, () => {
    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          Add Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add as Admin</DialogTitle>
        <Input
          hasPaste
          placeholder="Paste your wallet want to add here"
          onInputChange={setAddress}
        />
        <ErrorText error={error} />
        <Button onClick={() => mutate()} loading={isPending} className="" variant={'secondary'}>
          Add
        </Button>
      </DialogContent>
    </Dialog>
  )
})
