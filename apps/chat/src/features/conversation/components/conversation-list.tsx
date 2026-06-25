'use client'
import type { Conversation } from '@/modules/conversation'
import { setConveration } from '@/new/conversation'
import { useCurrentAccount } from '@/shared/hooks'
import { uiActions, useUiStore } from '@/stores/ui.store'
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
  const micOpen = useUiStore((s) => s.micOpen)

  const { data: conversations = [] } = useGetConversations(account)
  // const { inboxes } = useInboxes()

  const filteredConversations = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase()
    if (!keyword) return conversations
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        (c.lastMessage?.type === 'text' && c.lastMessage.content.toLowerCase().includes(keyword))
    )
  }, [conversations, searchKeyword])

  const handleClickConversation = React.useCallback(
    (conversation: Conversation) => {
      if (micOpen) {
        uiActions.setDiscardRecording(true)
        return
      }
      setConveration(conversation.conversationId, { unreadCount: 0 })

      navigate({
        to: '/$type/$id',
        params: { id: conversation.conversationId, type: conversation.conversationType }
      })
    },
    [navigate, micOpen]
  )

  console.log('filteredConversations', filteredConversations)
  return (
    <div className="flex flex-col gap-3 pb-[120px] pointer-events-auto">
      {filteredConversations.map((item) => (
        <ItemConversation
          conversation={item}
          conversationId={item.conversationId}
          key={item.conversationId}
          name={item.name}
          updatedAt={item.updatedAt}
          // avatar={item.avatar}
          unreadCount={item.unreadCount}
          lastMessage={item.lastMessage}
          isMine={Boolean(item.lastMessage?.sender === account?.contractAddress)}
          type={item.conversationType}
          onClick={() => handleClickConversation(item)}
          isVerified={item.isVerifed}
        />
      ))}
    </div>
  )
}

export default React.memo(ConversationList)
