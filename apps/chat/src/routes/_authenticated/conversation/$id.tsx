import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { cn } from '@/shared/lib'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/conversation/$id')({
  component: RouteComponent
})

function RouteComponent() {
  const router = useRouter()
  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-5')}>
      <WapperHeader alwaysScrolled>
        <div>
          <button onClick={() => router.history.back()}>
            <ChevronLeft />
          </button>
        </div>
      </WapperHeader>
    </div>
  )
}
