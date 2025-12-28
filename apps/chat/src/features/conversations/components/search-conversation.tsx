'use client'
import { SearchInput } from '@/shared/components/search-input'
import * as React from 'react'

function SearchConversation() {
  return (
    <div className="w-full pt-1">
      <SearchInput placeholder="Search..." />
    </div>
  )
}

export default React.memo(SearchConversation)
