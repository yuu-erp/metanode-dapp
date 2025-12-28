import {
  ConversationBackgroundSync,
  ConversationList,
  SearchConversation
} from '@/features/conversations'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'
import { CirclePlus } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-5')}>
      <WapperHeader>
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Chats</h1>
          <ConversationBackgroundSync />
          <div>
            <button>
              <CirclePlus className="size-6" />
            </button>
          </div>
        </div>
        <SearchConversation />
      </WapperHeader>
      <div className="flex flex-col w-full pt-[90px]">
        <ConversationList />
      </div>
    </div>
  )
}
