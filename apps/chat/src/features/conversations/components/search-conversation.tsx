'use client'
import { SearchInput } from '@/shared/components/search-input'
import * as React from 'react'

type SearchConversationProps = React.ComponentProps<typeof SearchInput>

function SearchConversation({
  placeholder = 'Search conversations...',
  className,
  ...props
}: SearchConversationProps) {
  return (
    <div className="w-full pt-1">
      <SearchInput placeholder={placeholder} {...props} className={className} />
    </div>
  )
}

export default React.memo(SearchConversation)
