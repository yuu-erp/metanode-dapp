import { initPrivateFeature } from '@/bootstrap'
import { MessageReceivedProvider, Web3ProviderProvider } from '@/contexts'
import { AppSessionProvider, BackgroundSyncProvider } from '@/shared/background-sync'
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
      await initPrivateFeature()
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
    <Web3ProviderProvider wsUrl="wss://rpc-proxy-sequoia.iqnb.com:8446" options={{ debug: true }}>
      <MessageReceivedProvider>
        <BackgroundSyncProvider>
          <AppSessionProvider>
            <Outlet />
            {showNavbar && <NavbarMenu />}
          </AppSessionProvider>
        </BackgroundSyncProvider>
      </MessageReceivedProvider>
    </Web3ProviderProvider>
  )
}
