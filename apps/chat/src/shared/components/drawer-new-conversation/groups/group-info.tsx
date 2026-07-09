'use client'

import type { Conversation, PayloadAddMembers } from '@/modules/conversation'
import AvatarUser from '@/shared/components/avatar-user'
import { Input } from '@/shared/components/ui/input'
import { useI18N } from '@/shared/hooks'
import * as React from 'react'

interface GroupInfoProps {
  conversations: Conversation[]
  selectedMembers: PayloadAddMembers[]
  groupName: string
  setGroupName: (groupName: string) => void
}
function GroupInfo({ conversations, selectedMembers, groupName, setGroupName }: GroupInfoProps) {
  const { t } = useI18N()
  return (
    <React.Fragment>
      <div className="flex flex-col items-center pt-8 gap-6">
        {/* Avatar Upload Placeholder */}
        <div className="size-24 rounded-full bg-blue-500/20 text-[#3b82f6] flex items-center justify-center border-2 border-dashed border-blue-500/50 cursor-pointer hover:bg-blue-500/30 transition">
          <span className="text-2xl font-bold">
            {groupName ? groupName.charAt(0).toUpperCase() : '?'}
          </span>
        </div>

        <div className="w-full">
          <label className="text-sm text-gray-400 mb-2 block ml-1">
            {t('drawer.groupName', { defaultValue: 'Group Name' })}
          </label>
          <Input
            placeholder={t('drawer.enterGroupName', { defaultValue: 'Enter group name' })}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="h-12 rounded-xl basic"
          />
        </div>

        <div className="w-full flex flex-col gap-2 border-t border-white/10 pt-4 mt-2">
          <span className="text-sm text-gray-400 ml-1">
            {t('drawer.members', {
              count: selectedMembers.length,
              defaultValue: `${selectedMembers.length} members`
            })}
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((mem) => {
              const member = conversations.find((c) => c.conversationId === mem.conversationId)
              if (!member) return null
              return (
                <div key={mem.conversationId} className="flex flex-col items-center w-14 gap-1">
                  <AvatarUser name={member.name} size="md" />
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
