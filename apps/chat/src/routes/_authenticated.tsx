import { EventLogProvider } from '@/contexts'
import { IncomingCall } from '@/features/call'
import { ConversationsProvider } from '@/features/conversation'
import { MessageProvider } from '@/features/message'
import { BackgroundSyncProvider } from '@/shared/background-sync'
import NavbarMenu from '@/shared/components/partials/navbar-menu'
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
            <div className="flex-1 flex flex-col min-w-0 relative">
              <Outlet />
            </div>
            {showNavbar && <NavbarMenu />}
          </BackgroundSyncProvider>
        </MessageProvider>
      </ConversationsProvider>
    </EventLogProvider>
  )
}
