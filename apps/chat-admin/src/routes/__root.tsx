import { images } from '@/assets'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  beforeLoad: () => {},

  component: () => {
    return (
      <>
        <div className="h-dvh w-dvw flex flex-col overflow-hidden">
          <img className="size-full absolute inset-0 -z-1" src={images.background} />
          <Outlet />
        </div>
      </>
    )
  }
})
