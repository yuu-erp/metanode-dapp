import { ListSettings, ProfileInfo } from '@/features/settings'
import { WapperHeader } from '@/shared/components/wappers/wapper-header'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className={cn('w-full h-screen flex flex-col')}>
      <WapperHeader>
        <div className="flex items-center justify-between gap-3 relative">
          <h1 className="text-xl font-bold">Settings</h1>
          <button className="font-semibold">Edit</button>
        </div>
        <ProfileInfo />
      </WapperHeader>
      <div className="flex flex-col w-full relative" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="flex-1 flex flex-col w-full">
          <ListSettings />
        </div>
      </div>
    </div>
  )
}
