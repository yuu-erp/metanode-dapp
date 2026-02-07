import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { createUserProfileQuery, useUserProfile } from '@/shared/hooks'
import { queryClient } from '@/shared/lib/react-query'
import { AppHeader } from '@/shared/partials'
import AppSidebar from '@/shared/partials/app-sidebar'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_agent/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await queryClient.ensureQueryData(createUserProfileQuery())
    if (!user)
      throw redirect({
        to: '/403'
      })

    const role = user.role
    if (role === 'USER' && !location.pathname.startsWith('/user')) {
      throw redirect({
        to: '/user'
      })
    }
    if (role === 'STAFF' && !location.pathname.startsWith('/staff')) {
      throw redirect({
        to: '/staff'
      })
    }
    if (role === 'MANAGER' && !location.pathname.startsWith('/manager')) {
      throw redirect({
        to: '/manager'
      })
    }
    if (role === 'OWNER' && !location.pathname.startsWith('/owner')) {
      throw redirect({
        to: '/owner'
      })
    }
    return { user }
  },
  component: RouteComponent
})

function RouteComponent() {
  const { data: user } = useUserProfile()
  return (
    <SidebarProvider className="w-screen h-screen min-h-full flex-row bg-transparent">
      <AppSidebar user={user} />
      <SidebarInset className="bg-transparent gap-2 xl:gap-4 z-10 padding-app pl-0">
        <AppHeader user={user} />
        <main className="flex-1 w-full h-full pr-2 pb-2">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
