import { ConnectWallet } from '@/components/wallet/ConnectWallet'
import { CreateWallet } from '@/components/wallet/CreateWallet'
import { ImportWallet } from '@/components/wallet/ImportWallet'
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
      <div className="size-full flex flex-col gap-5 items-center justify-center p-5">
        <p className="font-bold text-3xl">Connect Wallet</p>
        <ListWallet />
        <div className="flex gap-3">
          <ConnectWallet />
          <CreateWallet />
          <ImportWallet />
        </div>
      </div>
    </>
  )
}
