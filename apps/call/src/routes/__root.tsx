import { EventLogProvider } from '@/context/event-log.context'
import { FinsdkProvider } from '@/context/finsdk.context'
import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <FinsdkProvider>
      <EventLogProvider>
        <Outlet />
      </EventLogProvider>
    </FinsdkProvider>
  )
})
