import { useGroupInfo } from '@/shared/hooks/group/use-group-info'
import { useLeaveGroup } from '@/shared/hooks/group/use-leave-group'
import { memo } from 'react'
import { PopoverItem } from '../../../../../components/popover-item'
import { usePreLeaveGroup } from '@/shared/hooks/group/use-pre-leave-group'

export type LeaveGroupButtonProps = {
  onClose?: () => void
}

export const LeaveGroupButton = memo(({ onClose }: LeaveGroupButtonProps) => {
  const { isGroup } = useGroupInfo()
  const { mutate: leaveGroup } = useLeaveGroup()
  const pre = usePreLeaveGroup()

  if (!isGroup) return null

  return (
    <PopoverItem
      onClick={() => {
        const isContinue = pre()
        onClose?.()
        if (!isContinue) return
        leaveGroup()
      }}
    >
      Leave group
    </PopoverItem>
  )
})
