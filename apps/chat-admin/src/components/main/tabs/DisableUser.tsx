import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ErrorText } from '@/components/ui/ErrorText'
import { Input } from '@/components/ui/input'
import { useDisableUser } from '@/modules/chat-admin/disable-user'
import { UserLock } from 'lucide-react'
import { memo, useState } from 'react'
import { Button } from '../../ui/button'

export type DisableUserProps = {}

export const DisableUser = memo(({}: DisableUserProps) => {
  const [open, setOpen] = useState(false)
  const [address, setAddress] = useState('')
  const { mutate, isPending, error } = useDisableUser(address, () => {
    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserLock />
          Disable User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Disable User</DialogTitle>
        <Input
          hasPaste
          placeholder="Paste your wallet want to transfer here"
          onInputChange={setAddress}
        />
        <ErrorText error={error} />
        <Button className="" variant={'secondary'} onClick={() => mutate()} loading={isPending}>
          Disable
        </Button>
      </DialogContent>
    </Dialog>
  )
})
