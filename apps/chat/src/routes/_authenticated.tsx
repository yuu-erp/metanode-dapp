import { EventLogProvider } from '@/contexts'
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

const noNavbarRoutes = [/^\/conversation\/[^/]+$/]

function RouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const showNavbar = !noNavbarRoutes.some((regex) => regex.test(pathname))
  return (
    <EventLogProvider>
      <ConversationsProvider>
        <MessageProvider>
          <BackgroundSyncProvider>
            <Outlet />
            {showNavbar && <NavbarMenu />}
          </BackgroundSyncProvider>
        </MessageProvider>
      </ConversationsProvider>
    </EventLogProvider>
  )
}
