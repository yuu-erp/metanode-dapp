import { useGroupMember } from '@/features/conversation'
import { uiActions, useUiStore } from '@/stores/ui.store'
import { memo } from 'react'
import { GroupMemberItem } from './group-member-item'

export type MentionPopoverProps = {}

export const MentionPopover = memo(({}: MentionPopoverProps) => {
  const open = useUiStore((s) => s.mentionPopoverOpen)
  const { data = [] } = useGroupMember()

  if (!open) return null
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full p-3 w-[95%] flex flex-col max-h-100 overflow-y-auto bg-[#00000044] rounded-xl">
      {data.map((mem, index) => (
        <GroupMemberItem
          isFirst={index === 0}
          user={mem.contractAddress}
          onClick={(mention) => {
            uiActions.setPendingMention(mention)
            uiActions.setMentionPopoverOpen(false)
          }}
        />
      ))}
    </div>
  )
})
