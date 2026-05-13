import { images } from '@/assets'
import { contractAddresses } from '@/configs'
import { authedPathNames } from '@/constant/pathname.const'
import { ChatAdminProvider } from '@/context/ChatAdmin.context'
import { contractClient } from '@/contract'
import { abis } from '@/contract/abis'
import { useWalletStore } from '@/modules/wallet/wallet.store'
import { useFlowStore } from '@/stores/flow.store'
import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const { pathname } = location
    contractClient.registerAbiMethods(abis)
    contractClient.setTos(contractAddresses)

    const { persistedActive } = useWalletStore.getState()
    const { role } = useFlowStore.getState()
    const hasRole = role != null

    if (authedPathNames.includes(pathname)) {
      if (!persistedActive) {
        throw redirect({ to: '/set-wallet' })
      }
      if (!hasRole) {
        throw redirect({ to: '/error', search: { errorCode: 'UNAUTHORIZED' } })
      }
      contractClient.setFrom(persistedActive)
      return {}
    } else if (persistedActive && hasRole) {
      throw redirect({ to: '/' })
    } else if (pathname === '/error') {
      return {}
    } else {
      return {}
    }
  },

  component: () => {
    const { persistedActive } = useWalletStore()

    return (
      <ChatAdminProvider address={persistedActive}>
        <div className="h-dvh w-dvw flex flex-col overflow-hidden">
          <img className="size-full absolute inset-0 -z-1" src={images.background} />
          <Outlet />
        </div>
        <Toaster />
      </ChatAdminProvider>
    )
  }
})
