import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'

import Background from '@/shared/components/background'

export interface RouterContext {}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <React.Fragment>
      <main className="min-h-screen w-full relative z-10">
        <Outlet />
      </main>
      <Background />
      <TanStackRouterDevtools />
    </React.Fragment>
  )
})
