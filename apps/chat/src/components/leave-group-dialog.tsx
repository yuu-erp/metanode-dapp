import { Dialog, DialogContent } from '@/shared/components/ui/dialog'
import { DialogTitle } from '@headlessui/react'
import { memo } from 'react'
import { PopoverItem } from './popover-item'
import { leaveGroupActions, useLeaveGroupStore } from '@/stores'

export type LeaveGroupDialogProps = {}

export const LeaveGroupDialog = memo(({}: LeaveGroupDialogProps) => {
  const open = useLeaveGroupStore((s) => s.isLeaveGroup)

  return (
    <Dialog open={open} onOpenChange={leaveGroupActions.setIsLeaveGroup}>
      <DialogContent>
        <DialogTitle>Leave group</DialogTitle>
        <PopoverItem>Cancel</PopoverItem>
        <PopoverItem>Transfer another admin</PopoverItem>
        <PopoverItem>Leave</PopoverItem>
      </DialogContent>
    </Dialog>
  )
})
