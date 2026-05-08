import { ListWallet } from '@/components/wallet/ListWallet'
import { useWalletStore } from '@/modules/wallet/wallet.store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/set-wallet')({
  component: RouteComponent,
  beforeLoad: () => {
    const { persistedActive } = useWalletStore.getState()
    if (persistedActive) throw redirect({ to: '/' })
  }
})

function RouteComponent() {
  return (
    <>
      <ListWallet />
    </>
  )
}
