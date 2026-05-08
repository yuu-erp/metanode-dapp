import { uiActions, useUiStore } from '@/stores/ui.store'
import { memo, useEffect } from 'react'
import { ListMessageForSearchInChat } from './list-message-for-search-in-chat'
import { SearchInChatInput } from './search-in-chat-input'

export type SearchInChatPopoverProps = {}

export const SearchInChatPopover = memo(({}: SearchInChatPopoverProps) => {
  const searchOpen = useUiStore((s) => s.searchOpen)

  useEffect(() => {
    if (!searchOpen) return
    uiActions.setSearchValue('')
  }, [searchOpen])

  if (!searchOpen) return null
  return (
    <div className="absolute p-3 w-full bottom-0  translate-y-full bg-[#00000066] backdrop-blur-xl">
      <SearchInChatInput />
      <ListMessageForSearchInChat />
    </div>
  )
})
