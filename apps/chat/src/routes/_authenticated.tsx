import { EventLogProvider } from '@/contexts'
import { IncomingCall } from '@/features/call'
import { ConversationsProvider } from '@/features/conversation'
import { MessageProvider } from '@/features/message'
import { BackgroundSyncProvider } from '@/shared/background-sync'
import { AppSidebar } from '@/shared/components/partials/app-sidebar'
import NavbarMenu from '@/shared/components/partials/navbar-menu'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { createCurrentAccountQueryOptions } from '@/shared/hooks'
import { queryClient } from '@/shared/lib/react-query'
import { Outlet, createFileRoute, redirect, useRouterState } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  loader: async () => {
    try {
      const currentAccount = await queryClient.ensureQueryData(createCurrentAccountQueryOptions())
      if (!currentAccount || !currentAccount.isActive) {
        throw redirect({ to: '/wallets' })
      }
      return {}
    } catch (error) {
      console.error(error)
      throw redirect({ to: '/wallets' })
    }
  },
  component: RouteComponent
})

const noNavbarRoutes = [/^\/p2p\/[^/]+$/, /^\/group\/[^/]+$/]

function RouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showNavbar = !noNavbarRoutes.some((regex) => regex.test(pathname))
  return (
    <EventLogProvider>
      <ConversationsProvider>
        <MessageProvider>
          <BackgroundSyncProvider>
            <IncomingCall />
            <SidebarProvider
              style={
                {
                  '--sidebar-width': '24rem',
                  '--sidebar-background': 'transparent'
                } as React.CSSProperties
              }
            >
              <AppSidebar />
              <SidebarInset className="bg-transparent backdrop-blur-2xl">
                <div className="flex-1 flex flex-col min-w-0 relative">
                  <Outlet />
                  {showNavbar && <NavbarMenu />}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </BackgroundSyncProvider>
        </MessageProvider>
      </ConversationsProvider>
    </EventLogProvider>
  )
}
