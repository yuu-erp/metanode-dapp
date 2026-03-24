import { useCall } from '@/modules/call'
import ButtonBase from '@/shared/components/button/button-base'
import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { memo } from 'react'

export const ReloadCallDialog = memo(() => {
  const open = useCall((s) => s.reloadPopup)

  return (
    <Dialog open={open} onOpenChange={(value) => useCall.setState({ reloadPopup: value })}>
      <DialogContent className="flex flex-col items-center">
        <p className="text-black">Your connection is unstable. Would you like to try again?</p>
        <div className="flex gap-2">
          <ButtonBase onClick={() => window.location.reload()}>Reload</ButtonBase>
        </div>
      </DialogContent>
    </Dialog>
  )
})
