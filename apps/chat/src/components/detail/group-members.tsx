import { useGroupMember } from '@/features/conversation'
import { memo } from 'react'
import { GroupMemberItem } from '../group-member-item'

export type GroupMembersProps = {}

export const GroupMembers = memo(({}: GroupMembersProps) => {
  const { data = [] } = useGroupMember()

  return (
    <div className="flex-1 p-5 flex flex-col overflow-y-hidden">
      <div className="bg-[#00000044] flex flex-col rounded-md p-3">
        <p>Members</p>
        <div className="flex-1 overflow-y-auto mt-3">
          {data.map((member) => (
            <GroupMemberItem user={member} />
          ))}
        </div>
      </div>
    </div>
  )
})
