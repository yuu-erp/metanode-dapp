import { useCurrentState } from '@/hooks/use-current-state'
import { createMessageInfoQuery } from '@/new/message'
import { useMessaeges } from '@/new/message/list-mesage'
import { useUiStore } from '@/stores/ui.store'
import { useQueries } from '@tanstack/react-query'
import { getMetadata } from 'file-core'
import { memo } from 'react'
import { MessageItemForSearchInChat } from '../../features/message/components/header/message-item-for-search-in-chat'

export type ListMessageForSearchInChatProps = {}

export const ListMessageForSearchInChat = memo(({}: ListMessageForSearchInChatProps) => {
  const value = useUiStore((s) => s.searchValue)
  const { base } = useCurrentState()
  const { ids } = useMessaeges()
  const queries = useQueries({
    queries: ids.map((item) => createMessageInfoQuery(item, base))
  })
  const messages = queries.map((item) => item.data).filter(Boolean) as FulleMessage[]

  console.log('messages')
  const matchedList = messages.filter((msg) => {
    const isInclude = (input: string = '') =>
      input.toLowerCase().includes(value.toLocaleLowerCase())

    return (
      (msg.type === 'text' && isInclude(msg.content ?? '')) ||
      (msg.type === 'file' && isInclude(getMetadata(msg.fileIds?.[0])?.name))
    )
  })

  if (!value) return null
  return (
    <div className="flex flex-col">
      {matchedList.length === 0 && <p className="mt-2 text-center">No Result</p>}
      {matchedList.map((msg) => (
        <MessageItemForSearchInChat key={msg.id} message={msg} />
      ))}
    </div>
  )
})
