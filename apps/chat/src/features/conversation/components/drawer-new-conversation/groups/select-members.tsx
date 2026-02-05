'use client'

import type { Conversation } from '@/modules/conversation'
import ConversationContact from '@/shared/components/conversation-contact'
import { Checkbox } from '@/shared/components/ui/checkbox'
import * as React from 'react'
import type { Account } from '@/modules/account'

interface SelectMembersProps {
  conversations: Conversation[]
  account?: Account
  selectedMembers: string[]
  handleSelectMember: (id: string) => void
}
function SelectMembers({
  conversations = [],
  account,
  selectedMembers,
  handleSelectMember
}: SelectMembersProps) {
  return (
    <div className="flex flex-1 w-full flex-col gap-3 mt-3">
      {conversations.map((conversation) => {
        const isSelected = selectedMembers.includes(conversation.conversationId)
        if (account?.contractAddress === conversation.conversationId) return null
        if (conversation.conversationType === 'group') return null
        return (
          <div
            key={conversation.conversationId}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition"
            onClick={() => handleSelectMember(conversation.conversationId)}
          >
            <Checkbox
              checked={isSelected}
              onChange={() => handleSelectMember(conversation.conversationId)}
              className="border-gray-500 checked:bg-blue-500 checked:border-blue-500 rounded-full w-5 h-5"
            />
            <div className="pointer-events-none flex-1">
              <ConversationContact
                name={conversation.name}
                username={conversation.username}
                type="p2p"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(SelectMembers)
