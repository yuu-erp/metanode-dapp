import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { DialogTitle } from '@headlessui/react'
import { memo } from 'react'
import { PopoverItem } from './popover-item'

export type LeaveGroupDialogProps = {}

export const LeaveGroupDialog = memo(({}: LeaveGroupDialogProps) => {
  const open = useUiStore((s) => s.leaveGroupOpen)

  return (
    <Dialog open={open} onOpenChange={uiActions.setLeaveGroupOpen}>
      <DialogContent>
        <DialogTitle>Leave group</DialogTitle>
        <PopoverItem>Cancel</PopoverItem>
        <PopoverItem>Transfer another admin</PopoverItem>
        <PopoverItem>Leave</PopoverItem>
      </DialogContent>
    </Dialog>
  )
})
