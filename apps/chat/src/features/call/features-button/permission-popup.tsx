import { useModalStore } from '@/features/modal'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { memo } from 'react'

export const PermissionPopup = memo(() => {
  const message = useModalStore((s) => s.permissonWarning)

  return (
    <Dialog
      open={!!message}
      onOpenChange={(v) => {
        if (!v) useModalStore.setState({ permissonWarning: '' })
      }}
    >
      <DialogContent>
        <p className="text-foreground">{message}</p>
      </DialogContent>
    </Dialog>
  )
})
