import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Input } from './ui/input'

type SearchInputProps = React.ComponentProps<'input'>

function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        {...props}
        type="search"
        className={cn('pl-10 bg-white/60 rounded-xl border-none', className)}
      />
    </div>
  )
}

export { SearchInput }
