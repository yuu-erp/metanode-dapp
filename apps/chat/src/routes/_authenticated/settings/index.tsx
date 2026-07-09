import { ListSettings, ProfileInfo } from '@/features/settings'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent
})

function RouteComponent() {
  const isMobile = useIsMobile()
  return (
    <div className={cn('w-full h-screen flex flex-col')}>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Settings</h1>
          <button className="font-semibold">Edit</button>
        </div>
        <ProfileInfo />
      </div>
      <div className="flex flex-col w-full relative" style={{ paddingTop: isMobile ? '' : 'pt-5' }}>
        <div className="flex-1 flex flex-col w-full">
          <ListSettings />
        </div>
      </div>
    </div>
  )
}
