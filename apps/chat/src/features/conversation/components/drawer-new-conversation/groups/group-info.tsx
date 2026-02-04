'use client'

import type { Conversation } from '@/modules/conversation'
import AvatarUser from '@/shared/components/avatar-user'
import { Input } from '@/shared/components/ui/input'
import * as React from 'react'

interface GroupInfoProps {
  conversations: Conversation[]
  selectedMembers: string[]
  groupName: string
  setGroupName: (groupName: string) => void
}
function GroupInfo({ conversations, selectedMembers, groupName, setGroupName }: GroupInfoProps) {
  return (
    <React.Fragment>
      <div className="flex flex-col items-center pt-8 gap-6">
        {/* Avatar Upload Placeholder */}
        <div className="size-24 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center border-2 border-dashed border-blue-500/50 cursor-pointer hover:bg-blue-500/30 transition">
          <span className="text-2xl font-bold">
            {groupName ? groupName.charAt(0).toUpperCase() : '?'}
          </span>
        </div>

        <div className="w-full max-w-sm">
          <label className="text-sm text-gray-400 mb-2 block ml-1">Group Name</label>
          <Input
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="bg-[#2c2c2e] border-white/10 text-white h-12 rounded-xl"
            autoFocus
          />
        </div>

        <div className="w-full max-w-sm flex flex-col gap-2 border-t border-white/10 pt-4 mt-2">
          <span className="text-sm text-gray-400 ml-1">{selectedMembers.length} members</span>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((id) => {
              const member = conversations.find((c) => c.conversationId === id)
              if (!member) return null
              return (
                <div key={id} className="flex flex-col items-center w-14 gap-1">
                  <AvatarUser name={member.name} type="USER" size="md" />
                  <span className="text-[10px] text-gray-300 truncate w-full text-center">
                    {member.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default React.memo(GroupInfo)
