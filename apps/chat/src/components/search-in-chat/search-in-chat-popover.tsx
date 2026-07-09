import { uiActions, useUiStore } from '@/stores/ui.store'
import { memo, useEffect } from 'react'
import { ListMessageForSearchInChat } from './list-message-for-search-in-chat'
import { SearchInChatInput } from './search-in-chat-input'
import { cn } from '@/shared/lib'

export type SearchInChatPopoverProps = {
  height?: number
  width?: number
}

export const SearchInChatPopover = memo(({ height = 0, width = 0 }: SearchInChatPopoverProps) => {
  const searchOpen = useUiStore((s) => s.searchOpen)

  useEffect(() => {
    if (!searchOpen) return
    uiActions.setSearchValue('')
  }, [searchOpen])

  if (!searchOpen) return null
  return (
    <div
      className={cn(
        'fixed z-50 p-3 w-full h-max bottom-0 border-t border-black/20 flex flex-col',
        'bg-white/70 backdrop-blur-md-app'
      )}
      style={{
        right: 0,
        top: height,
        width
      }}
    >
      <SearchInChatInput />
      <ListMessageForSearchInChat />
    </div>
  )
})
