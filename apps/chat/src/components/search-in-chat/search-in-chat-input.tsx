import { uiActions, useUiStore } from '@/stores/ui.store'
import { Search, XCircle } from 'lucide-react'
import { memo, useEffect, useRef } from 'react'
export type SearchInChatInputProps = {}

export const SearchInChatInput = memo(({}: SearchInChatInputProps) => {
  const value = useUiStore((s) => s.searchValue)
  const ref = useRef<HTMLInputElement>(null)
  const searchOpen = useUiStore((s) => s.searchOpen)

  const onClose = () => {
    if (value) {
      uiActions.setSearchValue('')
      ref.current?.focus()
      return
    }
    ref.current?.blur()
    uiActions.setSearchOpen(false)
  }

  useEffect(() => {
    if (searchOpen) {
      ref.current?.focus()
    }
  }, [searchOpen])

  return (
    <div className="flex items-center gap-2 bg-[#ffffff1f] p-2 rounded-md">
      <Search className="size-4" />
      <input
        value={value}
        placeholder="Search"
        onChange={(e) => uiActions.setSearchValue(e.target.value)}
        className="w-full h-5 focus:outline-none"
        ref={ref}
      />
      <XCircle className="size-4" onClick={onClose} />
    </div>
  )
})
