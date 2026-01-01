'use client'
import { useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import ItemConversation from './item-conversation'
import { useGetConversations } from '..'

function ConversationList() {
  const navigate = useNavigate()
  const { data: conversations = [] } = useGetConversations()

  console.log('[CHAT] - DEBUG - CONVERSATIONS: ', conversations)
  return (
    <React.Fragment>
      <div className="flex flex-col gap-3 pb-[120px]">
        {[...conversations, ...conversations].map((item, idx) => (
          <ItemConversation
            key={idx}
            name={item.name}
            // avatar={item.avatar}
            updatedAt={item.updatedAt}
            latestMessageContent={item.latestMessageContent}
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
