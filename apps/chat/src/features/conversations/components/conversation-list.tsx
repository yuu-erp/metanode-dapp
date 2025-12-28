'use client'
import { getSession } from '@/bootstrap'
import { useGetConversations } from '@/shared/hooks'
import { useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { useConversationSyncTask } from '../hooks'
import ItemConversation from './item-conversation'

function ConversationList() {
  const navigate = useNavigate()
  const { conversation } = getSession()
  useConversationSyncTask(conversation?.sync)
  const { data: conversations = [] } = useGetConversations()
  return (
    <React.Fragment>
      <div className="flex flex-col gap-3 pb-[120px]">
        {conversations.map((item) => (
          <ItemConversation
            key={item.conversationId}
            name={item.name}
            avatar={item.avatar}
            updatedAt={item.updatedAt}
            lastMessageStatus={item.lastMessageStatus}
            onClick={() =>
              navigate({ to: '/conversation/$id', params: { id: item.conversationId } })
            }
          />
        ))}
      </div>
    </React.Fragment>
  )
}

export default React.memo(ConversationList)
