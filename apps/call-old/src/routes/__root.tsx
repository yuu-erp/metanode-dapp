import { BoostrapProvider } from '@/context/bootstrap.context'
import { FinsdkProvider } from '@/context/finsdk.context'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <FinsdkProvider>
      <BoostrapProvider>
        <Outlet />
      </BoostrapProvider>
    </FinsdkProvider>
  )
})
