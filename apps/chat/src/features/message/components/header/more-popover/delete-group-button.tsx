import { useGroupInfo } from '@/shared/hooks/group/use-group-info'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { useDeleteGroup } from '@/shared/hooks/use-delete-group'
import { useNavigate } from '@tanstack/react-router'
import { memo } from 'react'
import { PopoverItem } from '../../../../../components/popover-item'

export type DeleteGroupButtonProps = {}

export const DeleteGroupButton = memo(({}: DeleteGroupButtonProps) => {
  const { id } = useConversationParams()
  const deleteGroup = useDeleteGroup(id)
  const navigate = useNavigate()
  const { isAdmin, isGroup } = useGroupInfo()

  if (!isAdmin || !isGroup) return null
  return (
    <PopoverItem
      onClick={() => {
        deleteGroup.mutate()
        navigate({ to: '/' })
      }}
    >
      Delete group
    </PopoverItem>
  )
})
