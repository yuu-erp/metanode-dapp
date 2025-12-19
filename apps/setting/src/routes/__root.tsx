import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

interface RouterContextRoot {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContextRoot>()({
  component: () => (
    <>
      <Outlet />
    </>
  )
})
