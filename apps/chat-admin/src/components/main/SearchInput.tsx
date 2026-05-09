import { uiActions, useUiStore } from '@/stores/ui.store'
import { Search, X } from 'lucide-react'
import { memo } from 'react'
import { Input } from '../ui/input'

export type SearchInputProps = {}

export const SearchInput = memo(({}: SearchInputProps) => {
  const value = useUiStore((s) => s.searchValue)
  return (
    <Input
      classNames={{
        wrapper: 'rounded-full'
      }}
      value={value}
      placeholder="Search..."
      onChange={(e) => uiActions.setSearchValue(e.target.value)}
      leftNode={<Search className="size-5" />}
      rightNode={
        value && (
          <div
            className="size-4 rounded-full bg-white/30 flex items-center justify-center"
            onClick={uiActions.resetSearch}
          >
            <X className="size-3" />
          </div>
        )
      }
    />
  )
})
