import { ListSettings, SettingHeader } from '@/features/settings'
import { cn } from '@/shared/lib'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className={cn('w-full h-screen flex flex-col', window.isHasNotch ? 'pt-14' : 'pt-5')}>
      <SettingHeader />
      <ListSettings />
    </div>
  )
}
