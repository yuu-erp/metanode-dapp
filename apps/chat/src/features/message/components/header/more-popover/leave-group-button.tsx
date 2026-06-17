import { useAdmin } from '@/shared/hooks/group/use-admin'
import { useGroupInfo } from '@/shared/hooks/group/use-group-info'
import { useLeaveGroup } from '@/shared/hooks/group/use-leave-group'
import { uiActions } from '@/stores/ui.store'
import { memo } from 'react'
import { PopoverItem } from '../../../../../components/popover-item'

export type LeaveGroupButtonProps = {
  onClose?: () => void
}

export const LeaveGroupButton = memo(({ onClose }: LeaveGroupButtonProps) => {
  const { isGroup } = useGroupInfo()
  const { mutate: leaveGroup } = useLeaveGroup()
  const { isAdmin } = useAdmin()

  if (!isGroup) return null

  return (
    <PopoverItem
      onClick={() => {
        onClose?.()

        if (isAdmin) {
          uiActions.setLeaveGroupOpen(true)
        } else {
          leaveGroup()
        }
      }}
    >
      Leave group
    </PopoverItem>
  )
})
