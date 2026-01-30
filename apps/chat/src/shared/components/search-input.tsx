import { cn } from '@/shared/lib/utils'
import { Search } from 'lucide-react'
import * as React from 'react'
import { Input } from './ui/input'

type SearchInputProps = React.ComponentProps<'input'>

function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <Input
        {...props}
        type="search"
        className={cn('pl-10 bg-black/40 rounded-xl border-none placeholder:text-muted', className)}
        style={{
          boxShadow: `2px 2px 6px 0px #0000004D inset`
        }}
      />
    </div>
  )
}

export { SearchInput }
