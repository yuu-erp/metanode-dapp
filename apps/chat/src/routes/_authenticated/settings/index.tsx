import { ListSettings } from '@/features/settings'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'
import { QrCodeIcon } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-5')}>
      <WapperHeader>
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Settings</h1>
          <button>
            <QrCodeIcon />
          </button>
        </div>
      </WapperHeader>
      <ListSettings />
    </div>
  )
}
