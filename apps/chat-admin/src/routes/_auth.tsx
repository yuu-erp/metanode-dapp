import { useWalletStore } from '@/modules/wallet/wallet.store'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  beforeLoad: () => {
    const { persistedActive } = useWalletStore.getState()
    if (!persistedActive) throw redirect({ to: '/set-wallet' })
  }
})

function RouteComponent() {
  return <Outlet />
}
