import { useConversationParams } from '@/shared/hooks/use-conversation-params'
import { uiActions } from '@/stores/ui.store'
import { Search } from 'lucide-react'
import { memo, useEffect } from 'react'

export type SearchInChatButtonProps = {}

export const SearchInChatButton = memo(({}: SearchInChatButtonProps) => {
  const { id } = useConversationParams()

  useEffect(() => {
    uiActions.setSearchOpen(false)
  }, [id])

  return <Search onClick={() => uiActions.setSearchOpen()} />
})
