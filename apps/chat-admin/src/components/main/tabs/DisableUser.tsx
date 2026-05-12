import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Copy, UserLock } from 'lucide-react'
import { memo } from 'react'
import { Button } from '../../ui/button'

export type DisableUserProps = {}

export const DisableUser = memo(({}: DisableUserProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UserLock />
          Disable User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Disable User</DialogTitle>
        <Input
          rightNode={<Copy className="siez-4" />}
          placeholder="Paste your wallet want to transfer here"
        />
        <Button className="" variant={'secondary'}>
          Disable
        </Button>
      </DialogContent>
    </Dialog>
  )
})
