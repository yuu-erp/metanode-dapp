'use client'
import { useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import ItemConversation from './item-conversation'
import { useGetConversations } from '../hooks'
import { useCurrentAccount } from '@/shared/hooks'
type ConversationListProps = {
  searchKeyword: string
}

function ConversationList({ searchKeyword }: ConversationListProps) {
  const navigate = useNavigate()
  const { data: currentAccount } = useCurrentAccount()

  const { data: conversations = [] } = useGetConversations(currentAccount?.address)

  const filteredConversations = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return conversations

    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.latestMessageContent.toLowerCase().includes(keyword)
    )
  }, [conversations, searchKeyword])

  return (
    <div className="flex flex-col gap-3 pb-[120px]">
      {filteredConversations.map((item) => (
        <ItemConversation
          key={item.conversationId}
          name={item.name}
          updatedAt={item.updatedAt}
          latestMessageContent={item.latestMessageContent}
          onClick={() =>
            navigate({
              to: '/conversation/$id',
              params: { id: item.conversationId }
            })
          }
        />
      ))}
    </div>
  )
}

export default React.memo(ConversationList)
