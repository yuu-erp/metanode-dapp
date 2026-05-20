import { useGroupInfo } from '@/shared/hooks/group/use-group-info'
import { uiActions } from '@/stores/ui.store'
import { memo } from 'react'
import { PopoverItem } from '../../../../../components/popover-item'

export type AddMemberButtonProps = {
  onClose?: () => void
}

export const AddMemberButton = memo(({ onClose }: AddMemberButtonProps) => {
  const { isAdmin, isGroup } = useGroupInfo()

  if (!isAdmin || !isGroup) return null
  return (
    <PopoverItem
      onClick={() => {
        uiActions.setAddGroupOpen(true)
        onClose?.()
      }}
    >
      Add member
    </PopoverItem>
  )
})
