import { NotificationSettings } from '@/features/settings'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { cn } from '@/shared/lib'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <div className={cn('w-full h-screen flex flex-col')}>
      <WapperHeader>
        <div className="flex items-center gap-3 relative w-full">
          <button onClick={() => navigate({ to: '/settings' })} className="absolute left-0 p-2">
            <ArrowLeft className="size-6" />
          </button>
          <h1 className="text-xl font-bold w-full text-center">Notifications and Sounds</h1>
        </div>
      </WapperHeader>
      <div className="flex flex-col w-full relative" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="flex-1 flex flex-col w-full pt-4">
          <NotificationSettings />
        </div>
      </div>
    </div>
  )
}
