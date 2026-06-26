'use client'

import type { Conversation, PayloadAddMembers } from '@/modules/conversation'
import ConversationContact from '@/shared/components/conversation-contact'
import { Checkbox } from '@/shared/components/ui/checkbox'
import * as React from 'react'
import type { Account } from '@/modules/account'
import { Input } from '@headlessui/react'
import { useI18N } from '@/shared/hooks'

interface SelectMembersProps {
  conversations: Conversation[]
  account?: Account
  selectedMembers: PayloadAddMembers[]
  handleSelectMember: (id: PayloadAddMembers) => void
}

function normalize(input: string) {
  return input.replaceAll(' ', '').toLocaleLowerCase()
}

function SelectMembers({
  conversations = [],
  account,
  selectedMembers,
  handleSelectMember
}: SelectMembersProps) {
  const { t } = useI18N()
  const [v, setV] = React.useState('')

  const filteredConversations = v
    ? conversations.filter(
        (item) =>
          normalize(item.name).includes(normalize(v)) ||
          normalize(item.username).includes(normalize(v))
      )
    : conversations

  return (
    <>
      <div className="flex items-center gap-2 px-4">
        <Input
          value={v}
          onChange={(e) => setV(e.target.value)}
          type="text"
          placeholder={t('search.addressOrUsername', {
            defaultValue: 'Search address or username'
          })}
          className="flex-1 h-12 rounded-full px-4 text-sm bg-[#2c2c2e] text-gray-100 placeholder:text-gray-300 border border-white/10 outline-none transition"
        />
      </div>
      <div className="flex flex-1 w-full flex-col gap-3 mt-3 overflow-y-auto">
        {filteredConversations.map((conversation) => {
          const isSelected = selectedMembers.some(
            (item) => item.conversationId === conversation.conversationId
          )
          if (account?.contractAddress === conversation.conversationId) return null
          if (conversation.conversationType !== 'p2p') return null
          return (
            <div
              key={conversation.conversationId}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition"
              onClick={() =>
                handleSelectMember({
                  conversationId: conversation.conversationId,
                  publicKey: conversation.conversationKey
                })
              }
            >
              <Checkbox
                checked={isSelected}
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
    </>
  )
}

export default React.memo(SelectMembers)
