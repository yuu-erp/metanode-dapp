import { useCurrentAccount, useGetConversationId } from '@/shared/hooks'
import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { useUiStore } from '@/stores/ui.store'
import { memo } from 'react'
import { MessageItemForSearchInChat } from '../../features/message/components/header/message-item-for-search-in-chat'
import { useViewInfiniteScroll } from '../../features/message/components/list-message'

export type ListMessageForSearchInChatProps = {}

export const ListMessageForSearchInChat = memo(({}: ListMessageForSearchInChatProps) => {
  const value = useUiStore((s) => s.searchValue)
  const { id, type } = useConversationParams()
  const { data: conversation } = useGetConversationId(id, type)
  const { data: account } = useCurrentAccount()
  const { messages } = useViewInfiniteScroll({ account, conversation: conversation ?? undefined })

  const matchedList = messages.filter(
    (msg) => msg.type === 'text' && msg.content.toLowerCase().includes(value.toLocaleLowerCase())
  )

  if (!value || !matchedList.length) return null
  return (
    <div className="flex flex-col">
      {matchedList.map((msg) => (
        <MessageItemForSearchInChat key={msg.id} message={msg} />
      ))}
    </div>
  )
})
