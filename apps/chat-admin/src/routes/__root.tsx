import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  beforeLoad: () => {},

  component: () => {
    return (
      <>
        <div className="h-dvh w-dvw flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </>
    )
  }
})
