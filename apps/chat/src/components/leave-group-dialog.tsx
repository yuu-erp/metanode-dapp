import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { memo } from 'react'
import { PopoverItem } from './popover-item'

export type LeaveGroupDialogProps = {}

export const LeaveGroupDialog = memo(({}: LeaveGroupDialogProps) => {
  const open = useUiStore((s) => s.leaveGroupOpen)

  const btns = [
    { label: 'Cancel', onClick: () => {} },
    { label: 'Transfer another admin' },
    { label: 'Leave' }
  ]

  return (
    <Dialog open={open} onOpenChange={uiActions.setLeaveGroupOpen}>
      <DialogContent>
        <p>Leave group</p>

        {btns.map((btn) => (
          <PopoverItem
            onClick={() => {
              uiActions.setLeaveGroupOpen(false)
              btn.onClick?.()
            }}
            key={btn.label}
          >
            {btn.label}
          </PopoverItem>
        ))}
      </DialogContent>
    </Dialog>
  )
})
