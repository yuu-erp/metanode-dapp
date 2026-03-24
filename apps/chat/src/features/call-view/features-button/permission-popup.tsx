import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { memo, type PropsWithChildren } from 'react'

export const PermissionPopup = memo(
  ({
    open,
    setOpen,
    children
  }: PropsWithChildren & {
    open?: boolean
    setOpen: (v: boolean) => void
  }) => {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <p className="text-foreground">{children}</p>
        </DialogContent>
      </Dialog>
    )
  }
)
