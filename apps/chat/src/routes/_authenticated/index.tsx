import { SearchInput } from '@/shared/components/search-input'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { createFileRoute } from '@tanstack/react-router'
import { CircleFadingPlus, SquarePen } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="w-full min-h-screen">
      <WapperHeader className="gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Chats</h1>
          <div className="flex gap-3">
            <CircleFadingPlus className="size-7" />
          </div>
        </div>

        <SearchInput />
      </WapperHeader>

      <main className="pt-[var(--header-height)]">
        <div className="h-[200vh]">12312312313123</div>
      </main>
    </div>
  )
}
