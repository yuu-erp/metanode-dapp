'use client'
import { ConversationList, SearchConversation } from '@/features/conversations'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'
import { SquarePen } from 'lucide-react'
import * as React from 'react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent
})

function RouteComponent() {
  const [keyword, setKeyword] = React.useState('')

  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-5')}>
      <WapperHeader>
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Chats</h1>
          {/* <ConversationBackgroundSync /> */}
          <button>
            <SquarePen className="size-6" />
          </button>
        </div>
        {/* Search nằm trong header nhưng controlled từ Route */}
        <SearchConversation value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </WapperHeader>
      <div className="flex flex-col w-full pt-[90px]">
        <ConversationList searchKeyword={keyword} />
      </div>
    </div>
  )
}
