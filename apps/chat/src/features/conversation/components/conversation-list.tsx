'use client'
import { useCurrentAccount } from '@/shared/hooks'
import { useNavigate } from '@tanstack/react-router'
import * as React from 'react'
import { useGetConversations } from '../hooks'
import ItemConversation from './item-conversation'
type ConversationListProps = {
  searchKeyword: string
}

function ConversationList({ searchKeyword }: ConversationListProps) {
  const navigate = useNavigate()
  const { data: account } = useCurrentAccount()

  const { data: conversations = [] } = useGetConversations(account?.address)

  const filteredConversations = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return conversations

    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        (c.lastMessage?.type === 'text' && c.lastMessage.content.toLowerCase().includes(keyword))
    )
  }, [conversations, searchKeyword])

  console.log('[CONVERSATION LIST] ------ FILTERED CONVERSATIONS', filteredConversations)

  return (
    <div className="flex flex-col gap-3 pb-[120px] pointer-events-auto">
      {filteredConversations.map((item) => (
        <ItemConversation
          key={item.conversationId}
          name={item.name}
          updatedAt={item.updatedAt}
          // avatar={item.avatar}
          unreadCount={item.unreadCount}
          lastMessage={item.lastMessage}
          isMine={Boolean(item.lastMessage?.sender === account?.contractAddress)}
          type={item.conversationType === 'private' ? 'PRIVATE' : 'USER'}
          isPin={item.conversationType === 'private'}
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
