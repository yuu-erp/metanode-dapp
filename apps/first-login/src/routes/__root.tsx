import Background from '@/components/background'
import { ConnectNodeProvider } from '@/contexts/connect-node.context'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <ConnectNodeProvider>
      <Outlet />
      <Background />
    </ConnectNodeProvider>
  )
})
