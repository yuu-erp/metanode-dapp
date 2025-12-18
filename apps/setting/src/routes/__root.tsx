import { TanStackDevtools } from '@tanstack/react-devtools'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'

interface RouterContextRoot {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContextRoot>()({
  component: () => (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right'
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />
          }
        ]}
      />
    </>
  )
})
